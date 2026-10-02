-- In-app chat between users and agents, the deal-closing flow, and reviews that are only
-- allowed after a completed deal. `auth.jwt() ->> 'sub'` is the Clerk user ID.
--
-- Deal flow:
--   1. A user messages the agent about a listing (one conversation per user + listing).
--   2. The agent proposes a deal in that conversation (sale or rent, agreed price).
--   3. The user confirms or declines it; the agent can cancel it while it's pending.
--   4. On confirmation the listing is marked sold/rented, and the user may review it once.
-- Status changes go through the security-definer functions below, never direct updates,
-- so each side can only make the transitions that belong to them.

-- ---------------------------------------------------------------------------
-- Listing status
-- ---------------------------------------------------------------------------
alter table public.properties
  add column status text not null default 'active'
    check (status in ('active', 'sold', 'rented'));

create index properties_status_idx on public.properties (status);

-- Users can delete their own agent profile (used when deleting their account).
create policy "Users can delete their own agent profile"
  on public.agents for delete
  to authenticated
  using ((select auth.jwt() ->> 'sub') = clerk_user_id);

grant delete on public.agents to authenticated;

-- ---------------------------------------------------------------------------
-- Conversations & messages
-- ---------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  buyer_id text not null default (auth.jwt() ->> 'sub'),
  -- There's no users table (accounts live in Clerk), so the buyer's display name and
  -- photo are captured when they start the conversation, for the agent's inbox.
  buyer_name text not null check (char_length(buyer_name) between 1 and 120),
  buyer_avatar text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  unique (property_id, buyer_id)
);

create index conversations_buyer_id_idx on public.conversations (buyer_id, last_message_at desc);
create index conversations_agent_id_idx on public.conversations (agent_id, last_message_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id text not null default (auth.jwt() ->> 'sub'),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_id_idx on public.messages (conversation_id, created_at);

-- True when the caller is the buyer or the agent in a conversation.
create or replace function public.is_conversation_participant(conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = conversation
      and (
        c.buyer_id = (select auth.jwt() ->> 'sub')
        or public.is_own_agent(c.agent_id)
      )
  );
$$;

revoke all on function public.is_conversation_participant(uuid) from public;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  to authenticated
  using (buyer_id = (select auth.jwt() ->> 'sub') or public.is_own_agent(agent_id));

-- A user can open a conversation about an active listing with that listing's agent,
-- as long as it isn't their own listing.
create policy "Users can start conversations about listings"
  on public.conversations for insert
  to authenticated
  with check (
    buyer_id = (select auth.jwt() ->> 'sub')
    and not public.is_own_agent(agent_id)
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.agent_id = conversations.agent_id
    )
  );

create policy "Users can delete conversations they started"
  on public.conversations for delete
  to authenticated
  using (buyer_id = (select auth.jwt() ->> 'sub'));

create policy "Participants can read messages"
  on public.messages for select
  to authenticated
  using (public.is_conversation_participant(conversation_id));

create policy "Participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.jwt() ->> 'sub')
    and public.is_conversation_participant(conversation_id)
  );

-- Only marking the other person's messages as read; the column grant below limits
-- updates to read_at.
create policy "Participants can mark received messages read"
  on public.messages for update
  to authenticated
  using (
    public.is_conversation_participant(conversation_id)
    and sender_id <> (select auth.jwt() ->> 'sub')
  )
  with check (
    public.is_conversation_participant(conversation_id)
    and sender_id <> (select auth.jwt() ->> 'sub')
  );

grant select, insert, delete on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

-- Keep the inbox preview and ordering current.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = left(new.body, 140)
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------------------------------------------------------------------------
-- Deals
-- ---------------------------------------------------------------------------
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  buyer_id text not null,
  deal_type text not null check (deal_type in ('sale', 'rent')),
  agreed_price numeric(14, 2) not null check (agreed_price > 0),
  status text not null default 'proposed'
    check (status in ('proposed', 'completed', 'declined', 'cancelled')),
  proposed_at timestamptz not null default now(),
  responded_at timestamptz
);

create index deals_conversation_id_idx on public.deals (conversation_id, proposed_at desc);
create index deals_buyer_id_idx on public.deals (buyer_id);
create index deals_agent_id_idx on public.deals (agent_id);
-- At most one pending proposal per conversation, and one completed deal per listing.
create unique index deals_one_pending_per_conversation
  on public.deals (conversation_id) where status = 'proposed';
create unique index deals_one_completed_per_property
  on public.deals (property_id) where status = 'completed';

alter table public.deals enable row level security;

create policy "Deal parties can view their deals"
  on public.deals for select
  to authenticated
  using (buyer_id = (select auth.jwt() ->> 'sub') or public.is_own_agent(agent_id));

grant select on public.deals to authenticated;

-- Agent proposes a deal in one of their conversations. Price/type come from the agent;
-- property, buyer and agent are copied from the conversation so they can't be forged.
create or replace function public.propose_deal(conversation uuid, price numeric, kind text)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  convo public.conversations;
  listing public.properties;
  result public.deals;
begin
  select * into convo from public.conversations where id = conversation;
  if convo.id is null or not public.is_own_agent(convo.agent_id) then
    raise exception 'Only the listing agent can propose a deal in this conversation.';
  end if;

  select * into listing from public.properties where id = convo.property_id;
  if listing.status <> 'active' then
    raise exception 'This listing is already %.', listing.status;
  end if;

  insert into public.deals (conversation_id, property_id, agent_id, buyer_id, deal_type, agreed_price)
  values (convo.id, convo.property_id, convo.agent_id, convo.buyer_id, kind, price)
  returning * into result;

  insert into public.messages (conversation_id, sender_id, body)
  values (
    convo.id,
    (select auth.jwt() ->> 'sub'),
    'Proposed a deal: PKR ' || to_char(price, 'FM999,999,999,999') || case when kind = 'rent' then ' per month (rent)' else ' (sale)' end
  );

  return result;
end;
$$;

-- Buyer accepts or declines a pending proposal. Accepting completes the deal and marks
-- the listing sold or rented.
create or replace function public.respond_to_deal(deal uuid, accept boolean)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_deal public.deals;
  result public.deals;
begin
  select * into current_deal from public.deals where id = deal for update;
  if current_deal.id is null or current_deal.buyer_id <> (select auth.jwt() ->> 'sub') then
    raise exception 'Only the buyer or tenant can respond to this deal.';
  end if;
  if current_deal.status <> 'proposed' then
    raise exception 'This deal is no longer pending.';
  end if;

  update public.deals
  set status = case when accept then 'completed' else 'declined' end,
      responded_at = now()
  where id = deal
  returning * into result;

  if accept then
    update public.properties
    set status = case when current_deal.deal_type = 'rent' then 'rented' else 'sold' end
    where id = current_deal.property_id;
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (
    current_deal.conversation_id,
    current_deal.buyer_id,
    case when accept then 'Confirmed the deal. 🎉' else 'Declined the deal proposal.' end
  );

  return result;
end;
$$;

-- Agent withdraws a pending proposal.
create or replace function public.cancel_deal(deal uuid)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_deal public.deals;
  result public.deals;
begin
  select * into current_deal from public.deals where id = deal for update;
  if current_deal.id is null or not public.is_own_agent(current_deal.agent_id) then
    raise exception 'Only the listing agent can cancel this deal.';
  end if;
  if current_deal.status <> 'proposed' then
    raise exception 'This deal is no longer pending.';
  end if;

  update public.deals
  set status = 'cancelled', responded_at = now()
  where id = deal
  returning * into result;

  insert into public.messages (conversation_id, sender_id, body)
  values (current_deal.conversation_id, (select auth.jwt() ->> 'sub'), 'Withdrew the deal proposal.');

  return result;
end;
$$;

revoke all on function public.propose_deal(uuid, numeric, text) from public;
revoke all on function public.respond_to_deal(uuid, boolean) from public;
revoke all on function public.cancel_deal(uuid) from public;
grant execute on function public.propose_deal(uuid, numeric, text) to authenticated;
grant execute on function public.respond_to_deal(uuid, boolean) to authenticated;
grant execute on function public.cancel_deal(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Reviews: only after a completed deal, one per deal
-- ---------------------------------------------------------------------------
alter table public.reviews
  add column deal_id uuid unique references public.deals (id) on delete set null;

drop policy "Users can create their own reviews" on public.reviews;

create policy "Buyers can review a property after completing a deal"
  on public.reviews for insert
  to authenticated
  with check (
    (select auth.jwt() ->> 'sub') = user_id
    and exists (
      select 1 from public.deals d
      where d.id = deal_id
        and d.status = 'completed'
        and d.buyer_id = (select auth.jwt() ->> 'sub')
        and d.property_id = reviews.property_id
    )
  );

-- Keep a listing's rating equal to the average of its reviews.
create or replace function public.refresh_property_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.property_id, old.property_id);
begin
  update public.properties
  set rating = coalesce(
    (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.property_id = target),
    0
  )
  where id = target;
  return null;
end;
$$;

create trigger reviews_refresh_property_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_property_rating();

-- ---------------------------------------------------------------------------
-- Realtime: live chat, inbox and deal updates (RLS still applies to subscribers)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.deals;

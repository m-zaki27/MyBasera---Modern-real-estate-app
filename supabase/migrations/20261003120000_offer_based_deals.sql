-- Replaces the agent-only "propose deal" flow with an offer/negotiation flow either side
-- can drive, plus two-sided completion. The previous deals table had no rows yet.
--
--   negotiating ──accept──▶ accepted ──both mark complete──▶ completed
--       │  ▲                   │
--  counter (other side)        └─cancel (either side)──▶ cancelled
--       │
--   decline (other side) ──▶ declined     withdraw (offer's author) ──▶ withdrawn
--
-- While a deal is accepted the listing is "under_offer": still visible, but no new offers.
-- Every transition goes through a security-definer function that checks whose turn it is.

-- ---------------------------------------------------------------------------
-- Tear down the first version (functions, reviews' dependency, table)
-- ---------------------------------------------------------------------------
drop function if exists public.propose_deal(uuid, numeric, text);
drop function if exists public.respond_to_deal(uuid, boolean);
drop function if exists public.cancel_deal(uuid);

drop policy if exists "Buyers can review a property after completing a deal" on public.reviews;
alter table public.reviews drop constraint if exists reviews_deal_id_fkey;

alter publication supabase_realtime drop table public.deals;
drop table public.deals;

-- ---------------------------------------------------------------------------
-- Listing status gains "under_offer"
-- ---------------------------------------------------------------------------
alter table public.properties drop constraint if exists properties_status_check;
alter table public.properties
  add constraint properties_status_check
  check (status in ('active', 'under_offer', 'sold', 'rented'));

-- ---------------------------------------------------------------------------
-- Deals and their event history
-- ---------------------------------------------------------------------------
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  buyer_id text not null,
  deal_type text not null check (deal_type in ('sale', 'rent')),
  status text not null default 'negotiating'
    check (status in ('negotiating', 'accepted', 'completed', 'declined', 'withdrawn', 'cancelled')),
  amount numeric(14, 2) not null check (amount > 0),          -- latest offered / agreed price
  last_offer_by text not null check (last_offer_by in ('buyer', 'agent')),
  move_in_date date,                                          -- rentals
  lease_months integer check (lease_months between 1 and 120), -- rentals
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  agent_completed_at timestamptz,
  buyer_completed_at timestamptz,
  completed_at timestamptz,
  closed_at timestamptz,          -- declined / withdrawn / cancelled
  close_reason text
);

create index deals_conversation_id_idx on public.deals (conversation_id, created_at desc);
create index deals_buyer_id_idx on public.deals (buyer_id, updated_at desc);
create index deals_agent_id_idx on public.deals (agent_id, updated_at desc);
-- One open deal per conversation; one accepted and one completed deal per listing.
create unique index deals_one_open_per_conversation
  on public.deals (conversation_id) where status in ('negotiating', 'accepted');
create unique index deals_one_accepted_per_property
  on public.deals (property_id) where status = 'accepted';
create unique index deals_one_completed_per_property
  on public.deals (property_id) where status = 'completed';

create table public.deal_events (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  actor text not null check (actor in ('buyer', 'agent')),
  kind text not null check (kind in (
    'offer', 'counter', 'accept', 'decline', 'withdraw', 'cancel', 'mark_complete', 'completed'
  )),
  amount numeric(14, 2),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create index deal_events_deal_id_idx on public.deal_events (deal_id, created_at);

alter table public.deals enable row level security;
alter table public.deal_events enable row level security;

create policy "Deal parties can view their deals"
  on public.deals for select
  to authenticated
  using (buyer_id = (select auth.jwt() ->> 'sub') or public.is_own_agent(agent_id));

create policy "Deal parties can view deal history"
  on public.deal_events for select
  to authenticated
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_id
        and (d.buyer_id = (select auth.jwt() ->> 'sub') or public.is_own_agent(d.agent_id))
    )
  );

-- Read-only to clients: all writes go through the functions below.
grant select on public.deals, public.deal_events to authenticated;

-- Reviews again require a completed deal (re-created against the new table).
alter table public.reviews
  add constraint reviews_deal_id_fkey foreign key (deal_id) references public.deals (id) on delete set null;

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

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Which side of a deal the caller is on: 'buyer', 'agent', or null.
create or replace function public.deal_role(target public.deals)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when target.buyer_id = (select auth.jwt() ->> 'sub') then 'buyer'
    when public.is_own_agent(target.agent_id) then 'agent'
  end;
$$;

-- Records a deal event and posts a matching line in the chat, as the caller.
create or replace function public.log_deal_event(
  target public.deals, actor text, kind text, amount numeric, note text, chat_text text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.deal_events (deal_id, actor, kind, amount, note)
  values (target.id, actor, kind, amount, nullif(btrim(note), ''));

  insert into public.messages (conversation_id, sender_id, body)
  values (
    target.conversation_id,
    (select auth.jwt() ->> 'sub'),
    chat_text || case when nullif(btrim(note), '') is not null then E'\n“' || btrim(note) || '”' else '' end
  );
end;
$$;

create or replace function public.format_pkr(amount numeric)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'PKR ' || to_char(amount, 'FM999,999,999,999');
$$;

-- Loads and row-locks a deal, failing if it doesn't exist.
create or replace function public.lock_deal(deal uuid)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.deals;
begin
  select * into target from public.deals where id = deal for update;
  if target.id is null then
    raise exception 'Deal not found.';
  end if;
  return target;
end;
$$;

-- The caller's side of a deal, failing if they're not part of it.
create or replace function public.require_deal_role(target public.deals)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  role text := public.deal_role(target);
begin
  if role is null then
    raise exception 'You are not part of this deal.';
  end if;
  return role;
end;
$$;

-- ---------------------------------------------------------------------------
-- Transitions
-- ---------------------------------------------------------------------------

-- Either side opens a deal in their conversation with a first offer.
create or replace function public.start_offer(
  conversation uuid,
  offer_amount numeric,
  note text default null,
  move_in_date date default null,
  lease_months integer default null
)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  convo public.conversations;
  listing public.properties;
  caller_role text;
  result public.deals;
begin
  select * into convo from public.conversations where id = conversation;
  if convo.id is null then
    raise exception 'Conversation not found.';
  end if;
  caller_role := case
    when convo.buyer_id = (select auth.jwt() ->> 'sub') then 'buyer'
    when public.is_own_agent(convo.agent_id) then 'agent'
  end;
  if caller_role is null then
    raise exception 'You are not part of this conversation.';
  end if;

  select * into listing from public.properties where id = convo.property_id;
  if listing.status <> 'active' then
    raise exception 'This listing is % and isn’t taking offers.', replace(listing.status, '_', ' ');
  end if;
  if offer_amount is null or offer_amount <= 0 then
    raise exception 'Enter an offer amount.';
  end if;

  insert into public.deals (
    conversation_id, property_id, agent_id, buyer_id, deal_type, amount, last_offer_by,
    move_in_date, lease_months
  )
  values (
    convo.id, convo.property_id, convo.agent_id, convo.buyer_id, listing.listing_type, offer_amount, caller_role,
    case when listing.listing_type = 'rent' then move_in_date end,
    case when listing.listing_type = 'rent' then lease_months end
  )
  returning * into result;

  perform public.log_deal_event(
    result, caller_role, 'offer', offer_amount, note,
    case when listing.listing_type = 'rent'
      then 'Sent a rental application: ' || public.format_pkr(offer_amount) || ' per month'
        || coalesce(' for ' || lease_months || ' months', '')
        || coalesce(', moving in ' || to_char(move_in_date, 'DD Mon YYYY'), '')
      else 'Made an offer: ' || public.format_pkr(offer_amount)
    end
  );
  return result;
end;
$$;

-- The side that did NOT make the latest offer replies with a different amount.
create or replace function public.counter_offer(deal uuid, offer_amount numeric, note text default null)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.deals;
  role text;
  result public.deals;
begin
  target := public.lock_deal(deal);
  role := public.require_deal_role(target);
  if target.status <> 'negotiating' then
    raise exception 'This deal is no longer being negotiated.';
  end if;
  if target.last_offer_by = role then
    raise exception 'Wait for the other side to respond to your offer.';
  end if;
  if offer_amount is null or offer_amount <= 0 then
    raise exception 'Enter a counter-offer amount.';
  end if;

  update public.deals
  set amount = offer_amount, last_offer_by = role, updated_at = now()
  where id = target.id
  returning * into result;

  perform public.log_deal_event(result, role, 'counter', offer_amount, note,
    'Countered with ' || public.format_pkr(offer_amount) || case when target.deal_type = 'rent' then ' per month' else '' end);
  return result;
end;
$$;

-- The side that did NOT make the latest offer accepts it; the listing goes under offer.
create or replace function public.accept_offer(deal uuid)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.deals;
  role text;
  listing public.properties;
  result public.deals;
begin
  target := public.lock_deal(deal);
  role := public.require_deal_role(target);
  if target.status <> 'negotiating' then
    raise exception 'This deal is no longer being negotiated.';
  end if;
  if target.last_offer_by = role then
    raise exception 'You can’t accept your own offer — wait for the other side.';
  end if;

  select * into listing from public.properties where id = target.property_id for update;
  if listing.status <> 'active' then
    raise exception 'This listing already has an accepted offer.';
  end if;

  update public.deals
  set status = 'accepted', accepted_at = now(), updated_at = now()
  where id = target.id
  returning * into result;

  update public.properties set status = 'under_offer' where id = target.property_id;

  perform public.log_deal_event(result, role, 'accept', target.amount, null,
    'Accepted the offer of ' || public.format_pkr(target.amount) || case when target.deal_type = 'rent' then ' per month' else '' end || '. 🤝');
  return result;
end;
$$;

-- The side that did NOT make the latest offer turns it down; negotiation ends.
create or replace function public.decline_offer(deal uuid, note text default null)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.deals;
  role text;
  result public.deals;
begin
  target := public.lock_deal(deal);
  role := public.require_deal_role(target);
  if target.status <> 'negotiating' then
    raise exception 'This deal is no longer being negotiated.';
  end if;
  if target.last_offer_by = role then
    raise exception 'To take back your own offer, withdraw it instead.';
  end if;

  update public.deals
  set status = 'declined', closed_at = now(), close_reason = nullif(btrim(note), ''), updated_at = now()
  where id = target.id
  returning * into result;

  perform public.log_deal_event(result, role, 'decline', null, note, 'Declined the offer.');
  return result;
end;
$$;

-- The author of the latest offer takes it back while it's still unanswered.
create or replace function public.withdraw_offer(deal uuid)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.deals;
  role text;
  result public.deals;
begin
  target := public.lock_deal(deal);
  role := public.require_deal_role(target);
  if target.status <> 'negotiating' then
    raise exception 'This deal is no longer being negotiated.';
  end if;
  if target.last_offer_by <> role then
    raise exception 'Only the person who made the latest offer can withdraw it.';
  end if;

  update public.deals
  set status = 'withdrawn', closed_at = now(), updated_at = now()
  where id = target.id
  returning * into result;

  perform public.log_deal_event(result, role, 'withdraw', null, null, 'Withdrew the offer.');
  return result;
end;
$$;

-- Either side backs out of an accepted (not yet completed) deal; the listing reopens.
create or replace function public.cancel_deal(deal uuid, reason text)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.deals;
  role text;
  result public.deals;
begin
  target := public.lock_deal(deal);
  role := public.require_deal_role(target);
  if target.status <> 'accepted' then
    raise exception 'Only an accepted deal can be cancelled.';
  end if;
  if nullif(btrim(reason), '') is null then
    raise exception 'Please give a reason for cancelling.';
  end if;

  update public.deals
  set status = 'cancelled', closed_at = now(), close_reason = btrim(reason), updated_at = now()
  where id = target.id
  returning * into result;

  update public.properties set status = 'active'
  where id = target.property_id and status = 'under_offer';

  perform public.log_deal_event(result, role, 'cancel', null, reason, 'Cancelled the deal.');
  return result;
end;
$$;

-- Each side confirms the handover happened; when both have, the deal completes and the
-- listing is marked sold or rented.
create or replace function public.mark_deal_complete(deal uuid)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.deals;
  role text;
  result public.deals;
begin
  target := public.lock_deal(deal);
  role := public.require_deal_role(target);
  if target.status <> 'accepted' then
    raise exception 'Only an accepted deal can be completed.';
  end if;
  if (role = 'agent' and target.agent_completed_at is not null)
     or (role = 'buyer' and target.buyer_completed_at is not null) then
    raise exception 'You’ve already marked this deal as completed.';
  end if;

  update public.deals
  set agent_completed_at = case when role = 'agent' then now() else agent_completed_at end,
      buyer_completed_at = case when role = 'buyer' then now() else buyer_completed_at end,
      updated_at = now()
  where id = target.id
  returning * into result;

  perform public.log_deal_event(result, role, 'mark_complete', null, null,
    'Marked the deal as completed. Waiting for the other side to confirm.');

  if result.agent_completed_at is not null and result.buyer_completed_at is not null then
    update public.deals
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = target.id
    returning * into result;

    update public.properties
    set status = case when target.deal_type = 'rent' then 'rented' else 'sold' end
    where id = target.property_id;

    insert into public.deal_events (deal_id, actor, kind, amount)
    values (target.id, role, 'completed', target.amount);
    insert into public.messages (conversation_id, sender_id, body)
    values (target.conversation_id, (select auth.jwt() ->> 'sub'), 'Deal completed. 🎉 Congratulations!');
  end if;

  return result;
end;
$$;

-- Only the transition functions are callable by clients; the helpers stay internal.
revoke all on function public.deal_role(public.deals) from public;
revoke all on function public.log_deal_event(public.deals, text, text, numeric, text, text) from public;
revoke all on function public.lock_deal(uuid) from public;
revoke all on function public.require_deal_role(public.deals) from public;
revoke all on function public.start_offer(uuid, numeric, text, date, integer) from public;
revoke all on function public.counter_offer(uuid, numeric, text) from public;
revoke all on function public.accept_offer(uuid) from public;
revoke all on function public.decline_offer(uuid, text) from public;
revoke all on function public.withdraw_offer(uuid) from public;
revoke all on function public.cancel_deal(uuid, text) from public;
revoke all on function public.mark_deal_complete(uuid) from public;

grant execute on function public.start_offer(uuid, numeric, text, date, integer) to authenticated;
grant execute on function public.counter_offer(uuid, numeric, text) to authenticated;
grant execute on function public.accept_offer(uuid) to authenticated;
grant execute on function public.decline_offer(uuid, text) to authenticated;
grant execute on function public.withdraw_offer(uuid) to authenticated;
grant execute on function public.cancel_deal(uuid, text) to authenticated;
grant execute on function public.mark_deal_complete(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.deals;
alter publication supabase_realtime add table public.deal_events;

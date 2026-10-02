-- Lets the person who listed a property for sale mark it as sold outside the in-app deal
-- flow (e.g. it sold offline), which takes it off Browse/Explore. Open negotiations on it
-- are closed with a note in their chats. "Relist" undoes a manual mark-as-sold.

create or replace function public.mark_listing_sold(listing uuid)
returns public.properties
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.properties;
  open_deal public.deals;
  reason constant text := 'The owner marked this property as sold.';
begin
  select * into target from public.properties where id = listing for update;
  if target.id is null then
    raise exception 'Listing not found.';
  end if;
  if not public.is_own_agent(target.agent_id) then
    raise exception 'Only the person who listed this property can mark it as sold.';
  end if;
  if target.listing_type <> 'sale' then
    raise exception 'Only properties listed for sale can be marked as sold.';
  end if;
  if target.status = 'sold' then
    raise exception 'This property is already marked as sold.';
  end if;
  if target.status = 'under_offer' then
    raise exception 'This property has an accepted offer — complete or cancel that deal instead.';
  end if;

  -- Close any offers still being negotiated, and tell the buyers in their chats.
  for open_deal in
    select * from public.deals where property_id = listing and status = 'negotiating' for update
  loop
    update public.deals
    set status = 'declined', closed_at = now(), close_reason = reason, updated_at = now()
    where id = open_deal.id;

    insert into public.deal_events (deal_id, actor, kind, note)
    values (open_deal.id, 'agent', 'decline', reason);

    insert into public.messages (conversation_id, sender_id, body)
    values (
      open_deal.conversation_id,
      (select auth.jwt() ->> 'sub'),
      'This property has been marked as sold, so your offer is now closed. Thanks for your interest!'
    );
  end loop;

  update public.properties set status = 'sold' where id = listing returning * into target;
  return target;
end;
$$;

-- Undo a manual "sold". Not allowed when the sale went through an in-app deal.
create or replace function public.relist_listing(listing uuid)
returns public.properties
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.properties;
begin
  select * into target from public.properties where id = listing for update;
  if target.id is null then
    raise exception 'Listing not found.';
  end if;
  if not public.is_own_agent(target.agent_id) then
    raise exception 'Only the person who listed this property can relist it.';
  end if;
  if target.status <> 'sold' then
    raise exception 'Only a property marked as sold can be relisted.';
  end if;
  if exists (select 1 from public.deals where property_id = listing and status = 'completed') then
    raise exception 'This property was sold through a MyBasera deal and can’t be relisted.';
  end if;

  update public.properties set status = 'active' where id = listing returning * into target;
  return target;
end;
$$;

-- Default EXECUTE grants were revoked in 20261003130000, so grant explicitly.
revoke all on function public.mark_listing_sold(uuid) from public, anon;
revoke all on function public.relist_listing(uuid) from public, anon;
grant execute on function public.mark_listing_sold(uuid) to authenticated;
grant execute on function public.relist_listing(uuid) to authenticated;

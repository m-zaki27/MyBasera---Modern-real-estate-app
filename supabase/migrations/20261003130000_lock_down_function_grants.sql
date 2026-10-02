-- Security fix: Supabase grants EXECUTE on new public-schema functions to `anon` and
-- `authenticated` by default, and `revoke ... from public` doesn't remove those grants.
-- That left the internal deal helpers callable over the API — e.g. anyone could call
-- log_deal_event to insert fake deal events/chat messages, or lock_deal to read any deal.
--
-- Internal helpers: callable only from other (security definer) functions.
revoke execute on function public.deal_role(public.deals) from anon, authenticated, public;
revoke execute on function public.log_deal_event(public.deals, text, text, numeric, text, text) from anon, authenticated, public;
revoke execute on function public.lock_deal(uuid) from anon, authenticated, public;
revoke execute on function public.require_deal_role(public.deals) from anon, authenticated, public;
revoke execute on function public.format_pkr(numeric) from anon, authenticated, public;

-- Deal transitions: signed-in users only (each function also checks the caller's role).
revoke execute on function public.start_offer(uuid, numeric, text, date, integer) from anon;
revoke execute on function public.counter_offer(uuid, numeric, text) from anon;
revoke execute on function public.accept_offer(uuid) from anon;
revoke execute on function public.decline_offer(uuid, text) from anon;
revoke execute on function public.withdraw_offer(uuid) from anon;
revoke execute on function public.cancel_deal(uuid, text) from anon;
revoke execute on function public.mark_deal_complete(uuid) from anon;

-- RLS helpers: policies for `authenticated` need them; anonymous callers don't.
revoke execute on function public.is_own_agent(uuid) from anon;
revoke execute on function public.is_conversation_participant(uuid) from anon;

-- Trigger functions run as triggers only.
revoke execute on function public.touch_conversation() from anon, authenticated, public;
revoke execute on function public.refresh_property_rating() from anon, authenticated, public;

-- Stop future functions in this schema from being auto-executable by API roles;
-- grant EXECUTE explicitly in the migration that creates each function instead.
alter default privileges in schema public revoke execute on functions from anon, authenticated, public;

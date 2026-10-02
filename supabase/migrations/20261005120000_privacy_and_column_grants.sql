-- Security audit fixes.
--
-- H1 — agents' contact details and Clerk IDs were readable by anyone holding the public
--      (publishable) API key, and the app had been copying each new agent's Clerk login
--      email onto their public profile without asking. Now:
--        • signed-out callers can read only an agent's id, name, avatar and created_at;
--        • email/phone are opt-in (agents add them in Edit profile), and the emails that
--          were copied automatically are cleared.
-- M1 — listing owners could set any column through the API, including `rating` (meant to
--      come only from reviews) and `status` (meant to change only through the deal and
--      mark-as-sold functions). Inserts/updates are now limited to the listing form's
--      columns; those two are written only by security-definer functions and triggers.

-- ---------------------------------------------------------------------------
-- H1: agent columns
-- ---------------------------------------------------------------------------
revoke select on public.agents from anon, authenticated;
grant select (id, name, avatar, created_at) on public.agents to anon;
grant select (id, name, avatar, email, phone, clerk_user_id, created_at) on public.agents to authenticated;

-- Agents may set only their display details; clerk_user_id is fixed at creation.
revoke insert, update on public.agents from authenticated;
grant insert (name, avatar, email, phone, clerk_user_id) on public.agents to authenticated;
grant update (name, avatar, email, phone) on public.agents to authenticated;

-- Clear login emails that were auto-copied onto user-created agent profiles (seeded demo
-- agents have no clerk_user_id and keep their sample contact details).
update public.agents set email = null where clerk_user_id is not null;

-- ---------------------------------------------------------------------------
-- M1: listing columns
-- ---------------------------------------------------------------------------
revoke insert, update on public.properties from authenticated;
grant insert (
  name, type, listing_type, price, address, latitude, longitude,
  bedrooms, bathrooms, area, facilities, image_url, agent_id
) on public.properties to authenticated;
grant update (
  name, type, listing_type, price, address, latitude, longitude,
  bedrooms, bathrooms, area, facilities, image_url
) on public.properties to authenticated;

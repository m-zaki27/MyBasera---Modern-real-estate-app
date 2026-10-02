-- Replace the seeded demo agents' realistic-looking phone numbers with obvious
-- placeholders, so the demo data can't point at real people's numbers.
-- (supabase/seed.sql carries the same values for fresh databases.)
update public.agents as a
set phone = v.phone
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, '+92 300 0000001'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, '+92 300 0000002'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, '+92 300 0000003'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, '+92 300 0000004')
) as v(id, phone)
where a.id = v.id and a.clerk_user_id is null;

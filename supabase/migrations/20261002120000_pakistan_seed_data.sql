-- Localize the seeded demo data to Pakistan: agents, cities, coordinates and PKR prices.
-- Only touches the fixed seed IDs, so user-created agents and listings are left alone.
-- (supabase/seed.sql carries the same data for fresh databases.)

update public.agents as a
set name = v.name, email = v.email, phone = v.phone
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'Ayesha Khan', 'ayesha.khan@example.com', '+92 300 0000001'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Bilal Ahmed', 'bilal.ahmed@example.com', '+92 300 0000002'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'Sana Malik', 'sana.malik@example.com', '+92 300 0000003'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'Usman Tariq', 'usman.tariq@example.com', '+92 300 0000004')
) as v(id, name, email, phone)
where a.id = v.id;

update public.properties as p
set
  name = v.name,
  type = v.type,
  listing_type = v.listing_type,
  price = v.price,
  address = v.address,
  latitude = v.latitude,
  longitude = v.longitude,
  bedrooms = v.bedrooms,
  bathrooms = v.bathrooms,
  area = v.area,
  agent_id = v.agent_id
from (values
  ('b0000000-0000-4000-8000-000000000001'::uuid, 'Modern Family Home', 'House', 'sale', 65000000, 'Phase 6, DHA, Lahore', 31.4730, 74.4590, 4, 3, 2250, 'a0000000-0000-4000-8000-000000000001'::uuid),
  ('b0000000-0000-4000-8000-000000000002'::uuid, 'Clifton Sea View Apartment', 'Apartment', 'rent', 180000, 'Block 2, Clifton, Karachi', 24.8205, 67.0305, 2, 2, 1100, 'a0000000-0000-4000-8000-000000000002'::uuid),
  ('b0000000-0000-4000-8000-000000000003'::uuid, 'Sea-Facing Villa', 'Villa', 'sale', 450000000, 'Phase 8, DHA, Karachi', 24.7925, 67.0660, 5, 5, 4800, 'a0000000-0000-4000-8000-000000000002'::uuid),
  ('b0000000-0000-4000-8000-000000000004'::uuid, 'Gulberg Heights Apartment', 'Condo', 'sale', 32000000, 'Gulberg III, Lahore', 31.5120, 74.3440, 2, 2, 1050, 'a0000000-0000-4000-8000-000000000001'::uuid),
  ('b0000000-0000-4000-8000-000000000005'::uuid, 'Margalla Hills Residence', 'House', 'sale', 280000000, 'Sector E-7, Islamabad', 33.7290, 73.0560, 4, 4, 3200, 'a0000000-0000-4000-8000-000000000003'::uuid),
  ('b0000000-0000-4000-8000-000000000006'::uuid, 'Bahria Town Townhouse', 'Townhouse', 'sale', 45000000, 'Phase 7, Bahria Town, Rawalpindi', 33.5290, 73.0960, 3, 3, 2100, 'a0000000-0000-4000-8000-000000000004'::uuid),
  ('b0000000-0000-4000-8000-000000000007'::uuid, 'Blue Area Studio', 'Studio', 'rent', 65000, 'Blue Area, Islamabad', 33.7090, 73.0550, 0, 1, 520, 'a0000000-0000-4000-8000-000000000003'::uuid),
  ('b0000000-0000-4000-8000-000000000008'::uuid, 'Rawal Lake View House', 'House', 'sale', 95000000, 'Bani Gala, Islamabad', 33.7190, 73.1500, 3, 2, 1650, 'a0000000-0000-4000-8000-000000000003'::uuid),
  ('b0000000-0000-4000-8000-000000000009'::uuid, 'F-7 Modern Mansion', 'Villa', 'sale', 600000000, 'Sector F-7/2, Islamabad', 33.7215, 73.0520, 5, 6, 5200, 'a0000000-0000-4000-8000-000000000003'::uuid),
  ('b0000000-0000-4000-8000-000000000010'::uuid, 'Johar Town Family House', 'House', 'sale', 38000000, 'Block J, Johar Town, Lahore', 31.4700, 74.2700, 3, 2, 1900, 'a0000000-0000-4000-8000-000000000001'::uuid),
  ('b0000000-0000-4000-8000-000000000011'::uuid, 'Gulshan Family Apartment', 'Apartment', 'rent', 95000, 'Block 13-D, Gulshan-e-Iqbal, Karachi', 24.9200, 67.0900, 3, 2, 1400, 'a0000000-0000-4000-8000-000000000002'::uuid),
  ('b0000000-0000-4000-8000-000000000012'::uuid, 'DHA Corner Villa', 'Villa', 'sale', 180000000, 'Phase 5, DHA, Lahore', 31.4630, 74.4100, 6, 5, 5600, 'a0000000-0000-4000-8000-000000000004'::uuid)
) as v(id, name, type, listing_type, price, address, latitude, longitude, bedrooms, bathrooms, area, agent_id)
where p.id = v.id;

-- Seed review text referred to the old US agent names and places.
update public.reviews as r
set comment = v.comment
from (values
  ('c0000000-0000-4000-8000-000000000001'::uuid, 'Beautiful home in a quiet block. Ayesha was fantastic to work with.'),
  ('c0000000-0000-4000-8000-000000000003'::uuid, 'Amazing sea view and the building gym is excellent.'),
  ('c0000000-0000-4000-8000-000000000004'::uuid, 'Stunning villa right by the sea. Worth every rupee.'),
  ('c0000000-0000-4000-8000-000000000005'::uuid, 'Great location in Gulberg, close to everything.'),
  ('c0000000-0000-4000-8000-000000000008'::uuid, 'Secure building, friendly guards, great neighbourhood.')
) as v(id, comment)
where r.id = v.id;

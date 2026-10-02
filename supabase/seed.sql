-- Development seed data (Pakistan, prices in PKR). Agents are fictional: example.com
-- emails and placeholder +92 300 000000x phone numbers. Safe to re-run: fixed IDs + `on conflict do nothing`.
-- Photos are hot-linked placeholders; listings created in the app upload to Supabase Storage.

insert into public.agents (id, name, avatar, email, phone) values
  ('a0000000-0000-4000-8000-000000000001', 'Ayesha Khan', 'https://randomuser.me/api/portraits/women/44.jpg', 'ayesha.khan@example.com', '+92 300 0000001'),
  ('a0000000-0000-4000-8000-000000000002', 'Bilal Ahmed', 'https://randomuser.me/api/portraits/men/32.jpg', 'bilal.ahmed@example.com', '+92 300 0000002'),
  ('a0000000-0000-4000-8000-000000000003', 'Sana Malik', 'https://randomuser.me/api/portraits/women/68.jpg', 'sana.malik@example.com', '+92 300 0000003'),
  ('a0000000-0000-4000-8000-000000000004', 'Usman Tariq', 'https://randomuser.me/api/portraits/men/75.jpg', 'usman.tariq@example.com', '+92 300 0000004')
on conflict (id) do nothing;

insert into public.properties
  (id, name, type, listing_type, price, address, latitude, longitude, bedrooms, bathrooms, area, rating, facilities, agent_id, image_url)
values
  ('b0000000-0000-4000-8000-000000000001', 'Modern Family Home', 'House', 'sale', 65000000, 'Phase 6, DHA, Lahore', 31.4730, 74.4590, 4, 3, 2250, 4.8,
   array['Parking', 'Garden', 'Laundry', 'Wifi'], 'a0000000-0000-4000-8000-000000000001',
   'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000002', 'Clifton Sea View Apartment', 'Apartment', 'rent', 180000, 'Block 2, Clifton, Karachi', 24.8205, 67.0305, 2, 2, 1100, 4.6,
   array['Gym', 'Elevator', 'Wifi', 'Laundry'], 'a0000000-0000-4000-8000-000000000002',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000003', 'Sea-Facing Villa', 'Villa', 'sale', 450000000, 'Phase 8, DHA, Karachi', 24.7925, 67.0660, 5, 5, 4800, 4.9,
   array['Pool', 'Parking', 'Gym', 'Garden', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000002',
   'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000004', 'Gulberg Heights Apartment', 'Condo', 'sale', 32000000, 'Gulberg III, Lahore', 31.5120, 74.3440, 2, 2, 1050, 4.3,
   array['Pool', 'Gym', 'Parking', 'Elevator'], 'a0000000-0000-4000-8000-000000000001',
   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000005', 'Margalla Hills Residence', 'House', 'sale', 280000000, 'Sector E-7, Islamabad', 33.7290, 73.0560, 4, 4, 3200, 4.7,
   array['Pool', 'Parking', 'Garden', 'Wifi'], 'a0000000-0000-4000-8000-000000000003',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000006', 'Bahria Town Townhouse', 'Townhouse', 'sale', 45000000, 'Phase 7, Bahria Town, Rawalpindi', 33.5290, 73.0960, 3, 3, 2100, 4.5,
   array['Garden', 'Laundry', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000004',
   'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000007', 'Blue Area Studio', 'Studio', 'rent', 65000, 'Blue Area, Islamabad', 33.7090, 73.0550, 0, 1, 520, 4.1,
   array['Wifi', 'Elevator', 'Gym'], 'a0000000-0000-4000-8000-000000000003',
   'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000008', 'Rawal Lake View House', 'House', 'sale', 95000000, 'Bani Gala, Islamabad', 33.7190, 73.1500, 3, 2, 1650, 4.4,
   array['Parking', 'Garden', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000003',
   'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000009', 'F-7 Modern Mansion', 'Villa', 'sale', 600000000, 'Sector F-7/2, Islamabad', 33.7215, 73.0520, 5, 6, 5200, 5.0,
   array['Pool', 'Gym', 'Parking', 'Garden', 'Wifi'], 'a0000000-0000-4000-8000-000000000003',
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000010', 'Johar Town Family House', 'House', 'sale', 38000000, 'Block J, Johar Town, Lahore', 31.4700, 74.2700, 3, 2, 1900, 4.2,
   array['Parking', 'Garden', 'Laundry'], 'a0000000-0000-4000-8000-000000000001',
   'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000011', 'Gulshan Family Apartment', 'Apartment', 'rent', 95000, 'Block 13-D, Gulshan-e-Iqbal, Karachi', 24.9200, 67.0900, 3, 2, 1400, 4.6,
   array['Gym', 'Elevator', 'Laundry', 'Wifi', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000002',
   'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000012', 'DHA Corner Villa', 'Villa', 'sale', 180000000, 'Phase 5, DHA, Lahore', 31.4630, 74.4100, 6, 5, 5600, 4.8,
   array['Pool', 'Parking', 'Garden', 'Gym', 'Wifi'], 'a0000000-0000-4000-8000-000000000004',
   'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80')
on conflict (id) do nothing;

-- Sample reviews from placeholder users (real reviews carry Clerk user IDs).
insert into public.reviews (id, property_id, user_id, rating, comment) values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'seed_user_1', 5, 'Beautiful home in a quiet block. Ayesha was fantastic to work with.'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'seed_user_2', 4, 'Great layout and lots of natural light. Street parking can be tight.'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'seed_user_3', 5, 'Amazing sea view and the building gym is excellent.'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'seed_user_1', 5, 'Stunning villa right by the sea. Worth every rupee.'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', 'seed_user_2', 4, 'Great location in Gulberg, close to everything.'),
  ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000007', 'seed_user_3', 4, 'Small but smartly designed. Perfect for one person.'),
  ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000009', 'seed_user_1', 5, 'An architectural gem. The agent answered every question quickly.'),
  ('c0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000011', 'seed_user_2', 5, 'Secure building, friendly guards, great neighbourhood.')
on conflict (id) do nothing;

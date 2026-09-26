-- Development seed data. Safe to re-run: fixed IDs + `on conflict do nothing`.
-- Images are hot-linked placeholders until listing uploads move to Supabase Storage.

insert into public.agents (id, name, avatar, email, phone) values
  ('a0000000-0000-4000-8000-000000000001', 'Sarah Mitchell', 'https://randomuser.me/api/portraits/women/44.jpg', 'sarah.mitchell@example.com', '+1 (415) 555-0142'),
  ('a0000000-0000-4000-8000-000000000002', 'David Chen', 'https://randomuser.me/api/portraits/men/32.jpg', 'david.chen@example.com', '+1 (212) 555-0187'),
  ('a0000000-0000-4000-8000-000000000003', 'Maria Gonzalez', 'https://randomuser.me/api/portraits/women/68.jpg', 'maria.gonzalez@example.com', '+1 (305) 555-0123'),
  ('a0000000-0000-4000-8000-000000000004', 'James Carter', 'https://randomuser.me/api/portraits/men/75.jpg', 'james.carter@example.com', '+1 (512) 555-0199')
on conflict (id) do nothing;

insert into public.properties
  (id, name, type, price, address, latitude, longitude, bedrooms, bathrooms, area, rating, facilities, agent_id, image_url)
values
  ('b0000000-0000-4000-8000-000000000001', 'Modern Family Home', 'House', 1250000, '2145 Lake Street, San Francisco, CA', 37.7858, -122.4828, 4, 3, 2400, 4.8,
   array['Parking', 'Garden', 'Laundry', 'Wifi'], 'a0000000-0000-4000-8000-000000000001',
   'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000002', 'Skyline Loft', 'Apartment', 3800, '88 Greenwich Street, New York, NY', 40.7081, -74.0134, 2, 2, 1100, 4.6,
   array['Gym', 'Elevator', 'Wifi', 'Laundry'], 'a0000000-0000-4000-8000-000000000002',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000003', 'Oceanview Villa', 'Villa', 3450000, '1200 Ocean Drive, Miami Beach, FL', 25.7826, -80.1301, 5, 5, 4800, 4.9,
   array['Pool', 'Parking', 'Gym', 'Garden', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000003',
   'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000004', 'Downtown Condo', 'Condo', 489000, '300 Congress Avenue, Austin, TX', 30.2655, -97.7431, 2, 2, 1050, 4.3,
   array['Pool', 'Gym', 'Parking', 'Elevator'], 'a0000000-0000-4000-8000-000000000004',
   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000005', 'Hillside Retreat', 'House', 1875000, '4521 Mulholland Drive, Los Angeles, CA', 34.1289, -118.3960, 4, 4, 3200, 4.7,
   array['Pool', 'Parking', 'Garden', 'Wifi'], 'a0000000-0000-4000-8000-000000000001',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000006', 'Brooklyn Brownstone', 'Townhouse', 2150000, '145 Park Place, Brooklyn, NY', 40.6782, -73.9712, 3, 3, 2100, 4.5,
   array['Garden', 'Laundry', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000002',
   'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000007', 'Cozy City Studio', 'Studio', 1950, '720 Brickell Avenue, Miami, FL', 25.7680, -80.1918, 0, 1, 520, 4.1,
   array['Wifi', 'Elevator', 'Gym'], 'a0000000-0000-4000-8000-000000000003',
   'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000008', 'Lakeside Cottage', 'House', 615000, '18 Lake Austin Blvd, Austin, TX', 30.2932, -97.7852, 3, 2, 1650, 4.4,
   array['Parking', 'Garden', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000004',
   'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000009', 'Glass Pavilion', 'Villa', 4200000, '77 Pacific Heights Blvd, San Francisco, CA', 37.7925, -122.4382, 5, 6, 5200, 5.0,
   array['Pool', 'Gym', 'Parking', 'Garden', 'Wifi'], 'a0000000-0000-4000-8000-000000000001',
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000010', 'Sunny Suburban House', 'House', 725000, '902 Maple Avenue, Pasadena, CA', 34.1478, -118.1445, 3, 2, 1900, 4.2,
   array['Parking', 'Garden', 'Laundry'], 'a0000000-0000-4000-8000-000000000001',
   'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000011', 'Midtown Residences', 'Apartment', 4600, '250 W 55th Street, New York, NY', 40.7648, -73.9822, 3, 2, 1400, 4.6,
   array['Gym', 'Elevator', 'Laundry', 'Wifi', 'Pet Friendly'], 'a0000000-0000-4000-8000-000000000002',
   'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'),
  ('b0000000-0000-4000-8000-000000000012', 'Palm Grove Estate', 'Villa', 2890000, '5 Star Island Drive, Miami Beach, FL', 25.7770, -80.1494, 6, 5, 5600, 4.8,
   array['Pool', 'Parking', 'Garden', 'Gym', 'Wifi'], 'a0000000-0000-4000-8000-000000000003',
   'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80')
on conflict (id) do nothing;

-- Sample reviews from placeholder users (real reviews will carry Clerk user IDs).
insert into public.reviews (id, property_id, user_id, rating, comment) values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'seed_user_1', 5, 'Beautiful home in a quiet neighborhood. Sarah was fantastic to work with.'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'seed_user_2', 4, 'Great layout and lots of natural light. Street parking can be tight.'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'seed_user_3', 5, 'The views are unreal and the building gym is excellent.'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'seed_user_1', 5, 'Stunning villa right on the water. Worth every penny.'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', 'seed_user_2', 4, 'Convenient downtown location, walkable to everything.'),
  ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000007', 'seed_user_3', 4, 'Small but smartly designed. Perfect for one person.'),
  ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000009', 'seed_user_1', 5, 'An architectural gem. The agent answered every question quickly.'),
  ('c0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000011', 'seed_user_2', 5, 'Friendly doorman, spotless building, great neighborhood.')
on conflict (id) do nothing;

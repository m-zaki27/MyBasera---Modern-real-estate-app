-- Initial schema: agents, properties, reviews, favorites.
--
-- Auth comes from Clerk via Supabase third-party auth: every request made by a
-- signed-in user carries a Clerk session token, so `auth.jwt() ->> 'sub'` is the
-- Clerk user ID (e.g. "user_2abc..."). User IDs are therefore `text`, not uuid.

-- ---------------------------------------------------------------------------
-- agents
-- ---------------------------------------------------------------------------
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  email text,
  phone text,
  clerk_user_id text unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null
    check (type in ('House', 'Apartment', 'Villa', 'Condo', 'Townhouse', 'Studio')),
  price numeric(12, 2) not null check (price >= 0),
  address text not null,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  area numeric(10, 2) check (area > 0), -- square feet
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  facilities text[] not null default '{}',
  agent_id uuid references public.agents (id) on delete set null,
  image_url text,
  created_at timestamptz not null default now()
);

create index properties_agent_id_idx on public.properties (agent_id);
create index properties_type_idx on public.properties (type);
create index properties_price_idx on public.properties (price);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id text not null default (auth.jwt() ->> 'sub'),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index reviews_property_id_idx on public.reviews (property_id);
create index reviews_user_id_idx on public.reviews (user_id);

-- ---------------------------------------------------------------------------
-- favorites (junction table)
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id text not null default (auth.jwt() ->> 'sub'),
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index favorites_property_id_idx on public.favorites (property_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.agents enable row level security;
alter table public.properties enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

-- Listings and agents are public, read-only data for the app. Writes happen via
-- migrations/seed (or the dashboard) until agent tooling exists.
create policy "Agents are viewable by everyone"
  on public.agents for select
  to anon, authenticated
  using (true);

create policy "Properties are viewable by everyone"
  on public.properties for select
  to anon, authenticated
  using (true);

-- Reviews: anyone signed in can read; users manage only their own.
create policy "Reviews are viewable by signed-in users"
  on public.reviews for select
  to authenticated
  using (true);

create policy "Users can create their own reviews"
  on public.reviews for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- Favorites: private to each user.
create policy "Users can view their own favorites"
  on public.favorites for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can add their own favorites"
  on public.favorites for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can remove their own favorites"
  on public.favorites for delete
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- ---------------------------------------------------------------------------
-- Data API grants (explicit, so access doesn't depend on project defaults)
-- ---------------------------------------------------------------------------
grant select on public.agents to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, delete on public.favorites to authenticated;

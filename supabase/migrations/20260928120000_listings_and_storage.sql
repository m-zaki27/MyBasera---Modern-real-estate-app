-- User-created listings, rent vs sale, and listing photos in Supabase Storage.
--
-- Any signed-in user can become an agent (one `agents` row per Clerk user, linked via
-- clerk_user_id) and create, edit, and delete their own listings. As before,
-- `auth.jwt() ->> 'sub'` is the Clerk user ID.

-- ---------------------------------------------------------------------------
-- Rent vs sale
-- ---------------------------------------------------------------------------
alter table public.properties
  add column listing_type text not null default 'sale'
    check (listing_type in ('sale', 'rent'));

create index properties_listing_type_idx on public.properties (listing_type);

-- The seeded listings priced per month are rentals.
update public.properties
set listing_type = 'rent'
where id in (
  'b0000000-0000-4000-8000-000000000002', -- Skyline Loft
  'b0000000-0000-4000-8000-000000000007', -- Cozy City Studio
  'b0000000-0000-4000-8000-000000000011'  -- Midtown Residences
);

-- ---------------------------------------------------------------------------
-- Agents: users manage their own agent profile
-- ---------------------------------------------------------------------------
create policy "Users can create their own agent profile"
  on public.agents for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = clerk_user_id);

create policy "Users can update their own agent profile"
  on public.agents for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = clerk_user_id)
  with check ((select auth.jwt() ->> 'sub') = clerk_user_id);

grant insert, update on public.agents to authenticated;

-- ---------------------------------------------------------------------------
-- Properties: agents manage their own listings
-- ---------------------------------------------------------------------------

-- True when the given agent row belongs to the calling Clerk user.
-- security definer + fixed search_path so it can read agents regardless of the
-- caller's grants, and stable so Postgres can cache it per statement.
create or replace function public.is_own_agent(agent uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.agents a
    where a.id = agent
      and a.clerk_user_id = (select auth.jwt() ->> 'sub')
  );
$$;

revoke all on function public.is_own_agent(uuid) from public;
grant execute on function public.is_own_agent(uuid) to authenticated;

create policy "Agents can create their own listings"
  on public.properties for insert
  to authenticated
  with check (public.is_own_agent(agent_id));

create policy "Agents can update their own listings"
  on public.properties for update
  to authenticated
  using (public.is_own_agent(agent_id))
  with check (public.is_own_agent(agent_id));

create policy "Agents can delete their own listings"
  on public.properties for delete
  to authenticated
  using (public.is_own_agent(agent_id));

grant insert, update, delete on public.properties to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: listing photos
-- ---------------------------------------------------------------------------
-- Public bucket: anyone can view listing photos by URL. Uploads are limited to
-- images up to 5 MB, and each user may only write inside a folder named after
-- their Clerk user ID: property-images/<clerk_user_id>/<file>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Public URLs don't need a select policy; this one exists because removing an
-- object (when a listing photo is replaced or deleted) requires select + delete.
create policy "Users can view their own listing photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "Users can upload listing photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "Users can replace their own listing photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  )
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "Users can delete their own listing photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

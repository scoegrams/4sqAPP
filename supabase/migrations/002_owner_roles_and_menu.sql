-- ── Owner & Staff roles ─────────────────────────────────────────────────────
-- This table controls who can access the Jackpot dashboard.
-- Roles: 'owner' | 'staff'
-- Add a row here for any email/user_id that should have access.

create table if not exists public.owner_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  email       text not null,
  role        text not null check (role in ('owner', 'staff')),
  created_at  timestamptz default now(),
  unique(user_id),
  unique(email)
);

alter table public.owner_roles enable row level security;

-- Only the user themselves (and service role) can read their own role.
-- This prevents regular users from knowing who the owners are.
create policy "Users can read their own role"
  on public.owner_roles for select
  using (auth.uid() = user_id);

-- Only service role can insert/update/delete roles (done via Supabase dashboard or migration).
-- No user-facing insert policy — roles are managed by the owner directly in the DB.

-- ── Back-fill: set user_id when a role-holder first logs in ──────────────────
-- This function runs on every sign-in to link the email → user_id automatically.
-- That way you can pre-add an owner by email before they ever log in.

create or replace function public.sync_owner_role_user_id()
returns trigger language plpgsql security definer as $$
begin
  update public.owner_roles
  set user_id = new.id
  where email = new.email
    and user_id is null;
  return new;
end;
$$;

-- Fires after a new user record is created in auth.users
create or replace trigger on_auth_user_created_sync_owner_role
  after insert on auth.users
  for each row execute procedure public.sync_owner_role_user_id();

-- ── Helper: seed the first owner ─────────────────────────────────────────────
-- Run this in the Supabase SQL editor to grant yourself owner access.
-- Replace the email with the owner's actual email address.
--
-- INSERT INTO public.owner_roles (email, role)
-- VALUES ('owner@foursquarebar.com', 'owner')
-- ON CONFLICT (email) DO NOTHING;

-- ── Menu content table ───────────────────────────────────────────────────────
-- Stores the versioned menu JSON, synced from the local Dexie store.
-- This is the source-of-truth for production reads (future).

create table if not exists public.menu_versions (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid references auth.users(id) on delete set null,
  note        text,
  snapshot    jsonb not null,
  created_at  timestamptz default now()
);

alter table public.menu_versions enable row level security;

-- Anyone can read the latest menu (public)
create policy "Anyone can read menu versions"
  on public.menu_versions for select using (true);

-- Only owners/staff can insert new versions
create policy "Owners can insert menu versions"
  on public.menu_versions for insert
  with check (
    exists (
      select 1 from public.owner_roles
      where user_id = auth.uid()
    )
  );

-- Global site appearance (Theme Studio + active preset) — public read, owners write
create table if not exists public.site_theme (
  id                  text primary key default 'global',
  active_theme_mode   text not null default 'light'
    check (active_theme_mode in ('light', 'dark', 'modern', 'apple')),
  studio_enabled      boolean not null default false,
  token_overrides     jsonb not null default '{}'::jsonb,
  updated_at          timestamptz not null default now()
);

-- Singleton row for the whole app
insert into public.site_theme (id) values ('global')
on conflict (id) do nothing;

alter table public.site_theme enable row level security;

create policy "Anyone can read site theme"
  on public.site_theme for select
  using (true);

create policy "Owners can update site theme"
  on public.site_theme for update
  using (
    exists (select 1 from public.owner_roles where user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.owner_roles where user_id = auth.uid())
  );

create policy "Owners can insert site theme"
  on public.site_theme for insert
  with check (
    exists (select 1 from public.owner_roles where user_id = auth.uid())
  );

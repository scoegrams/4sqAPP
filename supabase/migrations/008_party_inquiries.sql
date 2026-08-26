-- Party / event inquiry form submissions (public submit via Edge Function only)

create table if not exists public.party_inquiries (
  id            uuid primary key default gen_random_uuid(),
  inquiry_type  text not null check (inquiry_type in ('catering', 'venue', 'table')),
  name          text not null,
  email         text not null,
  phone         text not null,
  event_date    date,
  event_time    time,
  head_count    int check (head_count is null or head_count > 0),
  details       text,
  status        text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at    timestamptz not null default now()
);

comment on table public.party_inquiries is 'Host-your-party form submissions; inserted by party-inquiry Edge Function.';

create index if not exists party_inquiries_created_at_idx on public.party_inquiries (created_at desc);
create index if not exists party_inquiries_status_idx on public.party_inquiries (status);

alter table public.party_inquiries enable row level security;

-- Owners read inquiries in Jackpot admin; no public direct table access.
create policy "Owners read party inquiries"
  on public.party_inquiries for select
  to authenticated
  using (
    exists (
      select 1 from public.owner_roles o
      where o.user_id = auth.uid()
    )
  );

create policy "Owners update party inquiry status"
  on public.party_inquiries for update
  to authenticated
  using (
    exists (
      select 1 from public.owner_roles o
      where o.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.owner_roles o
      where o.user_id = auth.uid()
    )
  );

-- Rate limit bucket per browser session (Edge Function only)
create table if not exists public.party_inquiry_attempts (
  client_id     text primary key,
  submit_count  int not null default 0,
  window_start  timestamptz not null default now()
);

comment on table public.party_inquiry_attempts is 'Rate limit for party-inquiry Edge Function per client_id.';

alter table public.party_inquiry_attempts enable row level security;

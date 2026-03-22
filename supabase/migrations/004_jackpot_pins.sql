-- ── Jackpot staff PINs (no email for staff) ─────────────────────────────────
-- Up to 4 (or more) hashed PINs. Admin sets them in SQL (see DEPLOY.md).
-- verify_jwt=false Edge Function calls check_jackpot_pin via service role only.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.jackpot_pins (
  id          uuid primary key default gen_random_uuid(),
  pin_hash    text not null,
  label       text,
  sort_order  int not null default 0,
  created_at  timestamptz default now(),
  revoked_at  timestamptz
);

comment on table public.jackpot_pins is 'Staff PIN hashes for Jackpot; only service_role reads via Edge Function.';

alter table public.jackpot_pins enable row level security;

-- No policies: anon/authenticated cannot read hashes. Service role bypasses RLS.

-- Rate limit / lockout per browser session id (client-generated UUID)
create table if not exists public.jackpot_pin_attempts (
  client_id     text primary key,
  fail_count    int not null default 0,
  locked_until  timestamptz,
  updated_at    timestamptz default now()
);

comment on table public.jackpot_pin_attempts is 'Failed PIN tries per client_id; Edge Function enforces lockout.';

alter table public.jackpot_pin_attempts enable row level security;

-- Callable only by service_role (Edge Function). Not exposed to anon/authenticated.
create or replace function public.check_jackpot_pin(p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_pin is null or length(trim(p_pin)) < 1 then
    return false;
  end if;
  return exists (
    select 1
    from public.jackpot_pins
    where revoked_at is null
      and pin_hash = extensions.crypt(p_pin, pin_hash)
  );
end;
$$;

revoke all on function public.check_jackpot_pin(text) from public;
revoke all on function public.check_jackpot_pin(text) from anon;
revoke all on function public.check_jackpot_pin(text) from authenticated;
grant execute on function public.check_jackpot_pin(text) to service_role;

-- First staff PIN (48177). Idempotent — skips if an active pin already uses sort_order 1.
insert into public.jackpot_pins (pin_hash, label, sort_order)
select extensions.crypt('48177', extensions.gen_salt('bf')), 'Staff 1', 1
where not exists (
  select 1 from public.jackpot_pins
  where sort_order = 1 and revoked_at is null
);

-- More PINs: insert with sort_order 2–4 (or any free slot), e.g.
-- insert into public.jackpot_pins (pin_hash, label, sort_order)
-- values (extensions.crypt('your-pin', extensions.gen_salt('bf')), 'Staff 2', 2);

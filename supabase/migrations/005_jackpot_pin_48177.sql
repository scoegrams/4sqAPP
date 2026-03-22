-- Seed first Jackpot PIN **48177** if migration 004 ran before the seed was added.
-- Safe to re-run: only inserts when no active row has sort_order = 1.

insert into public.jackpot_pins (pin_hash, label, sort_order)
select extensions.crypt('48177', extensions.gen_salt('bf')), 'Staff 1', 1
where not exists (
  select 1 from public.jackpot_pins
  where sort_order = 1 and revoked_at is null
);

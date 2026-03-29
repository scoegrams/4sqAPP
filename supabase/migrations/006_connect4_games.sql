-- Online multiplayer Connect 4 games
create table if not exists public.connect4_games (
  id uuid primary key default gen_random_uuid(),
  game_code char(4) not null unique,
  status text not null default 'waiting',
  player1_id uuid references auth.users(id) on delete set null,
  player1_name text not null default 'Player 1',
  player2_id uuid references auth.users(id) on delete set null,
  player2_name text,
  board jsonb not null default '[[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null]]',
  current_turn text not null default 'red',
  winner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.connect4_games enable row level security;

-- Idempotent: safe to re-run if a previous attempt created policies but failed later
drop policy if exists "Anyone can read games" on public.connect4_games;
drop policy if exists "Authenticated users can create games" on public.connect4_games;
drop policy if exists "Players can update games" on public.connect4_games;
drop policy if exists "Creators can delete games" on public.connect4_games;

-- Lobby: anyone (incl. anon) can read all games
create policy "Anyone can read games"
  on public.connect4_games for select
  using (true);

-- Authenticated users can create games they own
create policy "Authenticated users can create games"
  on public.connect4_games for insert
  to authenticated
  with check (auth.uid() = player1_id);

-- Players in the game (or any auth user on open waiting games) can update
create policy "Players can update games"
  on public.connect4_games for update
  to authenticated
  using (
    auth.uid() = player1_id
    or auth.uid() = player2_id
    or (status = 'waiting' and player2_id is null)
  )
  with check (
    auth.uid() = player1_id
    or auth.uid() = player2_id
  );

-- Creators can delete (cancel) their own waiting games
create policy "Creators can delete games"
  on public.connect4_games for delete
  to authenticated
  using (auth.uid() = player1_id);

-- Enable realtime so lobby and in-game both receive live updates (skip if already added)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'connect4_games'
  ) then
    alter publication supabase_realtime add table public.connect4_games;
  end if;
end $$;

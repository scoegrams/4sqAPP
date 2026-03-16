-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  phone text,
  rewards_opted_in boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Connect 4 high scores (wins per user)
create table if not exists public.connect4_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null,
  wins int default 0,
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.connect4_scores enable row level security;

create policy "Anyone can read scores" on public.connect4_scores for select using (true);
create policy "Users can upsert own score" on public.connect4_scores for all using (auth.uid() = user_id);

-- Chat messages (global lobby for Connect 4)
create table if not exists public.connect4_chat (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.connect4_chat enable row level security;

create policy "Anyone can read chat" on public.connect4_chat for select using (true);
create policy "Authenticated users can insert" on public.connect4_chat for insert with check (auth.uid() = user_id);

-- Enable realtime for chat (run in Supabase dashboard if needed: Database → Replication → connect4_chat → on)
-- alter publication supabase_realtime add table public.connect4_chat;

-- Function to upsert score (increment wins)
create or replace function public.increment_connect4_win(p_display_name text)
returns void language plpgsql security definer as $$
begin
  insert into public.connect4_scores (user_id, display_name, wins, updated_at)
  values (auth.uid(), p_display_name, 1, now())
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    wins = connect4_scores.wins + 1,
    updated_at = now();
end;
$$;

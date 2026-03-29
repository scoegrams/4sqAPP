-- Enable realtime for the Connect 4 chat table so messages push to all subscribers instantly.
-- This was commented out in migration 001. Run this once in your Supabase SQL editor.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'connect4_chat'
  ) then
    alter publication supabase_realtime add table public.connect4_chat;
  end if;
end $$;

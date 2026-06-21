-- ══════════════════════════════════════════════════════════════════════════════
--  武侠学堂 · Wǔxiá Xuétáng — Supabase Schema
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  email           text,
  character_data  jsonb,
  vocab_progress  jsonb default '[]'::jsonb,
  quest_progress  jsonb default '{}'::jsonb,
  settings        jsonb default '{}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── Auto-create profile on signup ────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Leaderboard (optional) ───────────────────────────────────────────────────
create table if not exists public.leaderboard (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users on delete cascade,
  nickname    text not null,
  level       integer default 1,
  hsk_level   integer default 1,
  words_learned integer default 0,
  updated_at  timestamptz default now()
);

alter table public.leaderboard enable row level security;

create policy "Leaderboard is public"
  on public.leaderboard for select
  using (true);

create policy "Users can upsert own leaderboard"
  on public.leaderboard for insert
  with check (auth.uid() = user_id);

create policy "Users can update own leaderboard"
  on public.leaderboard for update
  using (auth.uid() = user_id);

-- ─── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists profiles_updated_at_idx on public.profiles (updated_at desc);
create index if not exists leaderboard_level_idx on public.leaderboard (level desc);
create index if not exists leaderboard_words_idx on public.leaderboard (words_learned desc);

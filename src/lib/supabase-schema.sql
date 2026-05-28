-- Run this in your Supabase SQL editor

-- Enable RLS
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique not null,
  name        text,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Portfolios table (one per user)
create table if not exists public.portfolios (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade unique not null,
  username    text unique not null,  -- denormalized for fast slug lookup
  data        jsonb not null default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger portfolios_updated_at
  before update on public.portfolios
  for each row execute function update_updated_at();

-- Row Level Security
alter table public.profiles   enable row level security;
alter table public.portfolios enable row level security;

-- Profiles: users can read all, only edit own
create policy "profiles_public_read"  on public.profiles for select using (true);
create policy "profiles_own_update"   on public.profiles for update using (auth.uid() = id);

-- Portfolios: anyone can read, only owner can write
create policy "portfolios_public_read" on public.portfolios for select using (true);
create policy "portfolios_own_insert"  on public.portfolios for insert with check (auth.uid() = user_id);
create policy "portfolios_own_update"  on public.portfolios for update using (auth.uid() = user_id);
create policy "portfolios_own_delete"  on public.portfolios for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if length(base_username) < 3 then base_username := 'user'; end if;
  final_username := base_username;
  loop
    exit when not exists (select 1 from public.profiles where username = final_username);
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;
  insert into public.profiles (id, email, name, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    final_username,
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/notionists/svg?seed=' || new.id)
  );
  insert into public.portfolios (user_id, username, data)
  values (new.id, final_username, '{"hero":{"name":"","title":"","bio":"","isVisible":true}}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

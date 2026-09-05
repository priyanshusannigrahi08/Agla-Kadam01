-- Run this in Supabase SQL Editor after schema.sql.
-- Stores the basic account profile every signed-in user completes before choosing mentor/mentee.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  age integer not null check (age between 13 and 120),
  phone text,
  city text,
  occupation text,
  bio text,
  preferred_role text check (preferred_role in ('mentee', 'mentor', 'both') or preferred_role is null)
);

create index if not exists profiles_updated_at_idx on public.profiles(updated_at desc);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own basic profile" on public.profiles;
create policy "Users can view their own basic profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can create their own basic profile" on public.profiles;
create policy "Users can create their own basic profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own basic profile" on public.profiles;
create policy "Users can update their own basic profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_profiles_updated_at();

grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

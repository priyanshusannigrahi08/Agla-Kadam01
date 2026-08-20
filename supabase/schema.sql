-- Run this in your Supabase project's SQL Editor (Project → SQL Editor → New query).
-- Creates the two tables the app writes to, plus baseline row-level security
-- so the public anon key can only INSERT, never read other people's data back.

create table if not exists mentors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  linkedin_url text not null,
  expertise text not null,
  availability text not null,
  calendly_url text not null,
  status text not null default 'pending' -- pending | approved | paused
);

create table if not exists mentees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  situation text not null,
  background text not null,
  stuck_on text not null,
  matched_mentor_id uuid references mentors(id),
  status text not null default 'unmatched' -- unmatched | matched | called
);

-- Enable Row Level Security
alter table mentees enable row level security;
alter table mentors enable row level security;

-- Allow anyone (the public anon key used by the website) to INSERT a new
-- signup row, but not to SELECT/UPDATE/DELETE — that keeps everyone's
-- contact info private from other visitors. You read/manage this data from
-- the Supabase dashboard using your own account, not through the app.
create policy "Public can insert mentees"
  on mentees for insert
  to anon
  with check (true);

create policy "Public can insert mentors"
  on mentors for insert
  to anon
  with check (true);

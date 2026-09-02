-- AglaKadam platform upgrade
-- Run this AFTER the existing schema.sql in Supabase SQL Editor.
-- Safe for an existing database: columns/tables are added only when missing.

alter table mentors add column if not exists user_id uuid;
alter table mentors add column if not exists headline text;
alter table mentors add column if not exists bio text;
alter table mentors add column if not exists role text;
alter table mentors add column if not exists company text;
alter table mentors add column if not exists location text;
alter table mentors add column if not exists photo_url text;
alter table mentors add column if not exists linkedin text;
alter table mentors add column if not exists calendly text;
alter table mentors add column if not exists experience text;
alter table mentors add column if not exists journey text;
alter table mentors add column if not exists why_mentor text;
alter table mentors add column if not exists verification_status text not null default 'pending';

alter table mentees add column if not exists user_id uuid;
alter table mentees add column if not exists photo_url text;
alter table mentees add column if not exists stage text;
alter table mentees add column if not exists area text;
alter table mentees add column if not exists challenge text;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mentor_id uuid not null references mentors(id) on delete cascade,
  reviewer_user_id uuid not null,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published',
  unique (mentor_id, reviewer_user_id)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mentee_user_id uuid not null,
  mentor_id uuid not null references mentors(id) on delete cascade,
  scheduled_for timestamptz,
  duration_minutes integer not null default 30 check (duration_minutes = 30),
  status text not null default 'requested',
  booking_url text,
  notes text
);

create index if not exists bookings_mentee_user_idx on bookings(mentee_user_id);
create index if not exists bookings_mentor_idx on bookings(mentor_id);
create index if not exists reviews_mentor_idx on reviews(mentor_id);

alter table reviews enable row level security;
alter table bookings enable row level security;

-- Public visitors may only see published reviews. No reviewer email is stored here.
drop policy if exists "Public can read published reviews" on reviews;
create policy "Public can read published reviews" on reviews
  for select to anon, authenticated using (status = 'published');

-- Signed-in users can create their own review. A unique constraint prevents duplicates.
drop policy if exists "Users can create own reviews" on reviews;
create policy "Users can create own reviews" on reviews
  for insert to authenticated
  with check (reviewer_user_id = auth.uid());

-- A signed-in mentee can create/read their own booking records.
drop policy if exists "Users can create own bookings" on bookings;
create policy "Users can create own bookings" on bookings
  for insert to authenticated
  with check (mentee_user_id = auth.uid());

drop policy if exists "Users can read own bookings" on bookings;
create policy "Users can read own bookings" on bookings
  for select to authenticated
  using (mentee_user_id = auth.uid());

-- Mentors can read bookings associated with their own mentor profile.
drop policy if exists "Mentors can read their bookings" on bookings;
create policy "Mentors can read their bookings" on bookings
  for select to authenticated
  using (exists (
    select 1 from mentors m
    where m.id = bookings.mentor_id and m.user_id = auth.uid()
  ));

-- Mentors can update their own booking status.
drop policy if exists "Mentors can update their bookings" on bookings;
create policy "Mentors can update their bookings" on bookings
  for update to authenticated
  using (exists (
    select 1 from mentors m
    where m.id = bookings.mentor_id and m.user_id = auth.uid()
  ));

-- Owners can view their own mentor/mentee profile.
drop policy if exists "Users can read own mentor profile" on mentors;
create policy "Users can read own mentor profile" on mentors
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users can read own mentee profile" on mentees;
create policy "Users can read own mentee profile" on mentees
  for select to authenticated using (user_id = auth.uid());

-- Public mentor directory: approved mentors only, with no email exposure.
create or replace view mentors_public as
select
  id, created_at, name, headline, bio, expertise, experience, company, role,
  location, linkedin, linkedin_url, calendly, calendly_url, photo_url,
  availability, verification_status
from mentors
where status = 'approved';

grant select on mentors_public to anon, authenticated;

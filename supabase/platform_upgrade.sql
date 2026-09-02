-- AglaKadam platform upgrade
-- Run this AFTER supabase/schema.sql in the Supabase SQL Editor.
-- This is the canonical application upgrade script for the current app.

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
alter table mentors alter column linkedin_url set default '';
alter table mentors alter column availability set default '';
alter table mentors alter column calendly_url set default '';

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
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  unique (mentor_id, reviewer_user_id)
);

-- Existing databases may already have reviews with the old published default.
alter table reviews alter column status set default 'pending';

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mentee_user_id uuid not null,
  mentor_id uuid not null references mentors(id) on delete cascade,
  scheduled_for timestamptz,
  duration_minutes integer not null default 30 check (duration_minutes = 30),
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled', 'completed')),
  booking_url text,
  notes text
);
create index if not exists bookings_mentee_user_idx on bookings(mentee_user_id);
create index if not exists bookings_mentor_idx on bookings(mentor_id);
create index if not exists reviews_mentor_idx on reviews(mentor_id);

alter table reviews enable row level security;
alter table bookings enable row level security;
alter table mentors enable row level security;
alter table mentees enable row level security;

-- Profile creation: anonymous legacy signups remain supported, while signed-in
-- users can only create a row owned by their own auth.uid().
drop policy if exists "Public can insert mentees" on mentees;
create policy "Public can insert mentees"
  on mentees for insert to anon with check (true);
drop policy if exists "Authenticated users can insert own mentee profile" on mentees;
create policy "Authenticated users can insert own mentee profile"
  on mentees for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Public can insert mentors" on mentors;
create policy "Public can insert mentors"
  on mentors for insert to anon with check (true);
drop policy if exists "Authenticated users can insert own mentor profile" on mentors;
create policy "Authenticated users can insert own mentor profile"
  on mentors for insert to authenticated with check (user_id = auth.uid());

-- Public review reads are limited to published reviews.
drop policy if exists "Public can read published reviews" on reviews;
create policy "Public can read published reviews"
  on reviews for select to anon, authenticated using (status = 'published');

-- A review must belong to the signed-in reviewer, be pending at insertion,
-- and have a recorded booking for the same mentor. This closes the old UI-only
-- eligibility check and prevents direct client inserts of published reviews.
drop policy if exists "Users can create own reviews" on reviews;
create policy "Users can create eligible pending reviews"
  on reviews for insert to authenticated
  with check (
    reviewer_user_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1
      from bookings b
      where b.mentee_user_id = auth.uid()
        and b.mentor_id = reviews.mentor_id
        and b.status in ('requested', 'confirmed', 'completed')
    )
  );

-- Booking records may only be created by signed-in mentees for currently
-- approved mentors. The client can still describe the external calendar link,
-- but the database does not treat that as proof of a completed appointment.
drop policy if exists "Users can create own bookings" on bookings;
create policy "Users can create own bookings"
  on bookings for insert to authenticated
  with check (
    mentee_user_id = auth.uid()
    and exists (
      select 1 from mentors m
      where m.id = bookings.mentor_id and m.status = 'approved'
    )
  );

drop policy if exists "Users can read own bookings" on bookings;
create policy "Users can read own bookings"
  on bookings for select to authenticated using (mentee_user_id = auth.uid());

drop policy if exists "Mentors can read their bookings" on bookings;
create policy "Mentors can read their bookings"
  on bookings for select to authenticated
  using (exists (select 1 from mentors m where m.id = bookings.mentor_id and m.user_id = auth.uid()));

drop policy if exists "Mentors can update their bookings" on bookings;
create policy "Mentors can update their bookings"
  on bookings for update to authenticated
  using (exists (select 1 from mentors m where m.id = bookings.mentor_id and m.user_id = auth.uid()))
  with check (exists (select 1 from mentors m where m.id = bookings.mentor_id and m.user_id = auth.uid()));

drop policy if exists "Users can read own mentor profile" on mentors;
create policy "Users can read own mentor profile"
  on mentors for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can read own mentee profile" on mentees;
create policy "Users can read own mentee profile"
  on mentees for select to authenticated using (user_id = auth.uid());

-- One canonical public view. Keep supabase/mentors_public_view.sql only as a
-- legacy reference; run this script after schema.sql so this definition wins.
drop view if exists mentors_public;
create view mentors_public as
select id, created_at, name, headline, bio, expertise, experience, company, role,
  location, linkedin, linkedin_url, calendly, calendly_url, photo_url, availability,
  verification_status
from mentors
where status = 'approved';
grant select on mentors_public to anon, authenticated;

-- Public profile photos. Uploads are restricted to signed-in users and the two
-- application folders; the bucket remains public so approved profile URLs work.
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Authenticated users can upload profile photos" on storage.objects;
create policy "Authenticated users can upload profile photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] in ('mentors', 'mentees')
  );

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

drop policy if exists "Public can read published reviews" on reviews;
create policy "Public can read published reviews"
  on reviews for select to anon, authenticated using (status = 'published');

drop policy if exists "Users can create own reviews" on reviews;
create policy "Users can create eligible pending reviews"
  on reviews for insert to authenticated
  with check (
    reviewer_user_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from bookings b
      where b.mentee_user_id = auth.uid()
        and b.mentor_id = reviews.mentor_id
        and b.status in ('requested', 'confirmed', 'completed')
    )
  );

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Authenticated users can upload profile photos" on storage.objects;
create policy "Authenticated users can upload profile photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] in ('mentors', 'mentees')
  );

drop policy if exists "Authenticated users can read profile photo metadata" on storage.objects;
create policy "Authenticated users can read profile photo metadata"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] in ('mentors', 'mentees')
  );

-- Prevent duplicate authenticated profiles. Triggers are used instead of a
-- unique index so an older database containing duplicate legacy rows can still
-- be upgraded; new authenticated rows are serialized per user id.
create or replace function public.prevent_duplicate_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(TG_TABLE_NAME || ':' || new.user_id::text, 0));

  if TG_TABLE_NAME = 'mentors' and exists (select 1 from public.mentors m where m.user_id = new.user_id and m.id <> coalesce(new.id, gen_random_uuid())) then
    raise exception 'A mentor profile already exists for this account.' using errcode = '23505';
  end if;

  if TG_TABLE_NAME = 'mentees' and exists (select 1 from public.mentees m where m.user_id = new.user_id and m.id <> coalesce(new.id, gen_random_uuid())) then
    raise exception 'A mentee profile already exists for this account.' using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_duplicate_mentor_profile on mentors;
create trigger prevent_duplicate_mentor_profile
before insert or update of user_id on mentors
for each row execute function public.prevent_duplicate_profile();

drop trigger if exists prevent_duplicate_mentee_profile on mentees;
create trigger prevent_duplicate_mentee_profile
before insert or update of user_id on mentees
for each row execute function public.prevent_duplicate_profile();

-- Prevent repeated 'I booked a slot' records for the same mentee/mentor pair
-- while still allowing a new booking after a prior booking is cancelled.
create or replace function public.prevent_duplicate_active_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'cancelled' then
    perform pg_advisory_xact_lock(hashtextextended('booking:' || new.mentee_user_id::text || ':' || new.mentor_id::text, 0));
    if exists (
      select 1 from public.bookings b
      where b.mentee_user_id = new.mentee_user_id
        and b.mentor_id = new.mentor_id
        and b.status <> 'cancelled'
        and b.id <> coalesce(new.id, gen_random_uuid())
    ) then
      raise exception 'An active booking already exists for this mentor.' using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_duplicate_active_booking on bookings;
create trigger prevent_duplicate_active_booking
before insert or update of mentee_user_id, mentor_id, status on bookings
for each row execute function public.prevent_duplicate_active_booking();

create index if not exists mentors_user_id_idx on mentors(user_id);
create index if not exists mentees_user_id_idx on mentees(user_id);
create index if not exists bookings_mentee_mentor_status_idx on bookings(mentee_user_id, mentor_id, status);

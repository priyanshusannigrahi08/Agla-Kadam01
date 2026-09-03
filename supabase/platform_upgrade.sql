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
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
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
  mentee_user_id uuid not null references auth.users(id) on delete cascade,
  mentor_id uuid not null references mentors(id) on delete cascade,
  scheduled_for timestamptz,
  duration_minutes integer not null default 30 check (duration_minutes = 30),
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled', 'completed')),
  booking_url text,
  notes text
);
create index if not exists bookings_mentee_user_idx on bookings(mentee_user_id);
create index if not exists bookings_mentor_idx on bookings(mentor_id);
create index if not exists bookings_mentor_status_idx on bookings(mentor_id, status);
create index if not exists reviews_mentor_idx on reviews(mentor_id);
create index if not exists reviews_reviewer_idx on reviews(reviewer_user_id);

alter table reviews enable row level security;
alter table bookings enable row level security;
alter table mentors enable row level security;
alter table mentees enable row level security;

drop policy if exists "Public can insert mentees" on mentees;
drop policy if exists "Public can insert mentors" on mentors;
drop policy if exists "Authenticated users can insert own mentee profile" on mentees;
create policy "Authenticated users can insert own mentee profile"
  on mentees for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Authenticated users can insert own mentor profile" on mentors;
create policy "Authenticated users can insert own mentor profile"
  on mentors for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Public can read published reviews" on reviews;
create policy "Public can read published reviews"
  on reviews for select to anon, authenticated using (status = 'published');
drop policy if exists "Users can create own reviews" on reviews;
drop policy if exists "Users can create eligible pending reviews" on reviews;
create policy "Users can create eligible pending reviews"
  on reviews for insert to authenticated
  with check (
    reviewer_user_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from public.bookings b
      where b.mentee_user_id = auth.uid()
        and b.mentor_id = reviews.mentor_id
        and b.status = 'completed'
    )
  );

drop policy if exists "Users can create own bookings" on bookings;
create policy "Users can create own bookings"
  on bookings for insert to authenticated
  with check (
    mentee_user_id = auth.uid()
    and exists (
      select 1 from public.mentors m
      where m.id = bookings.mentor_id and m.status = 'approved'
    )
  );
drop policy if exists "Users can read own bookings" on bookings;
create policy "Users can read own bookings"
  on bookings for select to authenticated using (mentee_user_id = auth.uid());
drop policy if exists "Mentors can read their bookings" on bookings;
create policy "Mentors can read their bookings"
  on bookings for select to authenticated
  using (exists (select 1 from public.mentors m where m.id = bookings.mentor_id and m.user_id = auth.uid()));
drop policy if exists "Mentors can update their bookings" on bookings;
create policy "Mentors can update their bookings"
  on bookings for update to authenticated
  using (exists (select 1 from public.mentors m where m.id = bookings.mentor_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.mentors m where m.id = bookings.mentor_id and m.user_id = auth.uid()));

drop policy if exists "Users can read own mentor profile" on mentors;
create policy "Users can read own mentor profile"
  on mentors for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can read own mentee profile" on mentees;
create policy "Users can read own mentee profile"
  on mentees for select to authenticated using (user_id = auth.uid());

-- Public mentor data is stored in a dedicated projection table instead of a PostgreSQL view.
drop view if exists mentors_public;
create table if not exists mentors_public (
  id uuid primary key references mentors(id) on delete cascade,
  created_at timestamptz not null,
  name text not null,
  headline text,
  bio text,
  expertise text,
  experience text,
  company text,
  role text,
  location text,
  linkedin text,
  linkedin_url text,
  calendly text,
  calendly_url text,
  photo_url text,
  availability text,
  verification_status text
);

alter table mentors_public enable row level security;
drop policy if exists "Public can read approved mentor projections" on mentors_public;
create policy "Public can read approved mentor projections"
  on mentors_public for select to anon, authenticated using (true);
revoke insert, update, delete on mentors_public from anon, authenticated;
grant select on mentors_public to anon, authenticated;

create or replace function public.sync_mentors_public()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.mentors_public where id = old.id;
    return old;
  end if;

  if new.status = 'approved' then
    insert into public.mentors_public (
      id, created_at, name, headline, bio, expertise, experience, company,
      role, location, linkedin, linkedin_url, calendly, calendly_url,
      photo_url, availability, verification_status
    ) values (
      new.id, new.created_at, new.name, new.headline, new.bio, new.expertise,
      new.experience, new.company, new.role, new.location, new.linkedin,
      new.linkedin_url, new.calendly, new.calendly_url, new.photo_url,
      new.availability, new.verification_status
    )
    on conflict (id) do update set
      created_at = excluded.created_at,
      name = excluded.name,
      headline = excluded.headline,
      bio = excluded.bio,
      expertise = excluded.expertise,
      experience = excluded.experience,
      company = excluded.company,
      role = excluded.role,
      location = excluded.location,
      linkedin = excluded.linkedin,
      linkedin_url = excluded.linkedin_url,
      calendly = excluded.calendly,
      calendly_url = excluded.calendly_url,
      photo_url = excluded.photo_url,
      availability = excluded.availability,
      verification_status = excluded.verification_status;
  else
    delete from public.mentors_public where id = new.id;
  end if;

  return new;
end;
$$;
revoke execute on function public.sync_mentors_public() from public, anon, authenticated;

drop trigger if exists sync_mentors_public on mentors;
create trigger sync_mentors_public
after insert or update or delete on mentors
for each row execute function public.sync_mentors_public();

insert into mentors_public (
  id, created_at, name, headline, bio, expertise, experience, company, role,
  location, linkedin, linkedin_url, calendly, calendly_url, photo_url,
  availability, verification_status
)
select
  id, created_at, name, headline, bio, expertise, experience, company, role,
  location, linkedin, linkedin_url, calendly, calendly_url, photo_url,
  availability, verification_status
from mentors
where status = 'approved'
on conflict (id) do update set
  created_at = excluded.created_at,
  name = excluded.name,
  headline = excluded.headline,
  bio = excluded.bio,
  expertise = excluded.expertise,
  experience = excluded.experience,
  company = excluded.company,
  role = excluded.role,
  location = excluded.location,
  linkedin = excluded.linkedin,
  linkedin_url = excluded.linkedin_url,
  calendly = excluded.calendly,
  calendly_url = excluded.calendly_url,
  photo_url = excluded.photo_url,
  availability = excluded.availability,
  verification_status = excluded.verification_status;

delete from mentors_public mp
where not exists (
  select 1 from mentors m
  where m.id = mp.id and m.status = 'approved'
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Authenticated users can upload profile photos" on storage.objects;
create policy "Authenticated users can upload profile photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] in ('mentors', 'mentees')
    and (storage.foldername(name))[2] = (select auth.uid()::text)
  );
drop policy if exists "Authenticated users can read profile photo metadata" on storage.objects;
create policy "Authenticated users can read profile photo metadata"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] in ('mentors', 'mentees')
    and (storage.foldername(name))[2] = (select auth.uid()::text)
  );

create or replace function public.prevent_duplicate_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(tg_table_name || ':' || new.user_id::text, 0));

  if tg_table_name = 'mentors' and exists (
    select 1 from public.mentors m
    where m.user_id = new.user_id and m.id <> new.id
  ) then
    raise exception 'A mentor profile already exists for this account.' using errcode = '23505';
  end if;

  if tg_table_name = 'mentees' and exists (
    select 1 from public.mentees m
    where m.user_id = new.user_id and m.id <> new.id
  ) then
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
revoke execute on function public.prevent_duplicate_profile() from public, anon, authenticated;

create or replace function public.prevent_duplicate_active_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'cancelled' then
    perform pg_advisory_xact_lock(hashtextextended('booking:' || new.mentee_user_id::text || ':' || new.mentor_id::text, 0));
    if exists (
      select 1 from public.bookings b
      where b.mentee_user_id = new.mentee_user_id
        and b.mentor_id = new.mentor_id
        and b.status <> 'cancelled'
        and b.id <> new.id
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
revoke execute on function public.prevent_duplicate_active_booking() from public, anon, authenticated;

create index if not exists mentors_user_id_idx on mentors(user_id);
create index if not exists mentees_user_id_idx on mentees(user_id);
create index if not exists bookings_mentee_mentor_status_idx on bookings(mentee_user_id, mentor_id, status);

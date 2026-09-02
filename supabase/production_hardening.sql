-- AglaKadam production hardening
-- Run AFTER supabase/platform_upgrade.sql.
-- This migration tightens the existing schema without deleting legacy rows.

-- Auth-owned profiles should follow the auth user lifecycle.
alter table public.mentors
  drop constraint if exists mentors_user_id_fkey;
alter table public.mentors
  add constraint mentors_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.mentees
  drop constraint if exists mentees_user_id_fkey;
alter table public.mentees
  add constraint mentees_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- The current app requires authentication before creating profiles. Remove the
-- old anonymous INSERT path so the public Data API cannot be used to spam rows.
drop policy if exists "Public can insert mentors" on public.mentors;
drop policy if exists "Public can insert mentees" on public.mentees;
revoke insert on table public.mentors from anon;
revoke insert on table public.mentees from anon;

-- Keep only the operations the browser actually needs on protected tables.
revoke all on table public.mentors from anon;
revoke all on table public.mentees from anon;
grant select, insert on table public.mentors to authenticated;
grant select, insert on table public.mentees to authenticated;

-- Public mentor discovery is intentionally exposed only through the projection.
revoke insert, update, delete on table public.mentors_public from anon, authenticated;
grant select on table public.mentors_public to anon, authenticated;

-- SECURITY DEFINER trigger functions must not use a mutable search_path.
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

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(TG_TABLE_NAME || ':' || new.user_id::text, 0)
  );

  if TG_TABLE_NAME = 'mentors' and exists (
    select 1
    from public.mentors m
    where m.user_id = new.user_id
      and m.id <> new.id
  ) then
    raise exception 'A mentor profile already exists for this account.' using errcode = '23505';
  end if;

  if TG_TABLE_NAME = 'mentees' and exists (
    select 1
    from public.mentees m
    where m.user_id = new.user_id
      and m.id <> new.id
  ) then
    raise exception 'A mentee profile already exists for this account.' using errcode = '23505';
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_duplicate_profile() from public, anon, authenticated;

create or replace function public.prevent_duplicate_active_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'cancelled' then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        'booking:' || new.mentee_user_id::text || ':' || new.mentor_id::text,
        0
      )
    );

    if exists (
      select 1
      from public.bookings b
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

revoke execute on function public.prevent_duplicate_active_booking() from public, anon, authenticated;

-- Keep RLS checks fast as profile and booking counts grow.
create index if not exists mentors_user_id_idx on public.mentors(user_id);
create index if not exists mentees_user_id_idx on public.mentees(user_id);
create index if not exists bookings_mentee_mentor_status_idx
  on public.bookings(mentee_user_id, mentor_id, status);
create index if not exists reviews_reviewer_idx
  on public.reviews(reviewer_user_id);

-- Only authenticated users can access their own booking rows through the API.
revoke all on table public.bookings from anon;
grant select, insert on table public.bookings to authenticated;

-- Reviews are submitted by authenticated users and publicly read only after
-- moderation. Do not expose direct UPDATE/DELETE from the browser.
revoke all on table public.reviews from anon;
grant select, insert on table public.reviews to authenticated;

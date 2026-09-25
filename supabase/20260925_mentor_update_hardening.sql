-- Mentor profile and booking-update hardening.
-- Run AFTER platform_upgrade.sql and production_hardening.sql.
-- This migration is additive and protects existing rows with NOT VALID FKs.

-- Client updates are limited to the fields exposed by the mentor workspace.
grant update (expertise, experience, journey, why_mentor, linkedin, calendly)
  on table public.mentors to authenticated;

drop policy if exists "Mentors can update own editable profile" on public.mentors;
create policy "Mentors can update own editable profile"
  on public.mentors for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS can constrain rows but not changed columns. This trigger prevents a
-- future broad UPDATE grant from exposing status, verification, or ownership.
create or replace function public.enforce_mentor_editable_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Service-role requests are used by server-side administration only.
  if auth.uid() is null then
    return new;
  end if;

  if old.user_id <> auth.uid() then
    raise exception 'Mentor profile ownership cannot be changed.' using errcode = '42501';
  end if;

  if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.status is distinct from old.status
    or new.verification_status is distinct from old.verification_status
    or new.name is distinct from old.name
    or new.email is distinct from old.email
    or new.created_at is distinct from old.created_at
  then
    raise exception 'This mentor field cannot be changed here.' using errcode = '42501';
  end if;

  return new;
end;
$$;
revoke execute on function public.enforce_mentor_editable_columns() from public, anon, authenticated;

drop trigger if exists enforce_mentor_editable_columns on public.mentors;
create trigger enforce_mentor_editable_columns
before update on public.mentors
for each row execute function public.enforce_mentor_editable_columns();

-- Mentors can only update the status of bookings assigned to their own profile.
grant update (status) on table public.bookings to authenticated;

drop policy if exists "Mentors can update their bookings" on public.bookings;
create policy "Mentors can update their bookings"
  on public.bookings for update to authenticated
  using (
    exists (
      select 1 from public.mentors m
      where m.id = bookings.mentor_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.mentors m
      where m.id = bookings.mentor_id and m.user_id = auth.uid()
    )
  );

create or replace function public.enforce_mentor_booking_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Cal.com and admin changes use the service role and remain server-side.
  if auth.uid() is null then
    return new;
  end if;

  if not exists (
    select 1 from public.mentors m
    where m.id = old.mentor_id and m.user_id = auth.uid()
  ) then
    raise exception 'Booking does not belong to this mentor.' using errcode = '42501';
  end if;

  if new.id is distinct from old.id
    or new.mentee_user_id is distinct from old.mentee_user_id
    or new.mentor_id is distinct from old.mentor_id
    or new.created_at is distinct from old.created_at
    or new.scheduled_for is distinct from old.scheduled_for
    or new.duration_minutes is distinct from old.duration_minutes
    or new.booking_url is distinct from old.booking_url
    or new.notes is distinct from old.notes
  then
    raise exception 'Mentors can only change booking status.' using errcode = '42501';
  end if;

  if not (
    (old.status = 'requested' and new.status in ('requested', 'confirmed', 'cancelled'))
    or (old.status = 'confirmed' and new.status in ('confirmed', 'completed', 'cancelled'))
    or (old.status = 'completed' and new.status = 'completed')
    or (old.status = 'cancelled' and new.status = 'cancelled')
  ) then
    raise exception 'Invalid booking status transition.' using errcode = '23514';
  end if;

  return new;
end;
$$;
revoke execute on function public.enforce_mentor_booking_update() from public, anon, authenticated;

drop trigger if exists enforce_mentor_booking_update on public.bookings;
create trigger enforce_mentor_booking_update
before update on public.bookings
for each row execute function public.enforce_mentor_booking_update();

-- A document row must refer to the same authenticated owner as its mentor.
create unique index if not exists mentors_id_user_id_unique_idx
  on public.mentors(id, user_id);

alter table public.mentor_documents
  drop constraint if exists mentor_documents_mentor_owner_fkey;
alter table public.mentor_documents
  add constraint mentor_documents_mentor_owner_fkey
  foreign key (mentor_id, user_id)
  references public.mentors(id, user_id)
  on delete cascade
  not valid;

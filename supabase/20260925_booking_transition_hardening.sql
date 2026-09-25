-- Booking state-machine hardening.
-- Run AFTER 20260925_mentor_update_hardening.sql.
-- Applies the same transition rules to dashboard, admin, and webhook writes.

create or replace function public.enforce_mentor_booking_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Browser-originated mentor updates are strictly status-only and owner-scoped.
  if auth.uid() is not null then
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
  end if;

  -- Service-role operations may update Cal.com metadata, but no caller can
  -- move a booking backward or reopen a terminal state.
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

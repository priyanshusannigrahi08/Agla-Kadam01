-- AglaKadam Cal.com integration
-- Run this AFTER supabase/platform_upgrade.sql.
-- Backward-compatible: existing bookings continue to work. Cal.com fields are nullable.

alter table public.bookings
  add column if not exists calcom_booking_uid text,
  add column if not exists calcom_booking_id bigint,
  add column if not exists calcom_event_type text,
  add column if not exists calcom_status text,
  add column if not exists calcom_last_event text,
  add column if not exists calcom_last_event_at timestamptz;

create unique index if not exists bookings_calcom_uid_unique_idx
  on public.bookings(calcom_booking_uid)
  where calcom_booking_uid is not null;

create index if not exists bookings_calcom_booking_id_idx
  on public.bookings(calcom_booking_id)
  where calcom_booking_id is not null;

create index if not exists bookings_scheduled_for_idx
  on public.bookings(scheduled_for)
  where scheduled_for is not null;

-- Store only provider identifiers/statuses here. The webhook route uses the
-- service role server-side, so no client policy is needed for these columns.
comment on column public.bookings.calcom_booking_uid is 'Cal.com booking UID used for webhook correlation';
comment on column public.bookings.calcom_booking_id is 'Cal.com numeric booking ID when supplied by the webhook';
comment on column public.bookings.calcom_event_type is 'Cal.com event type slug/name';
comment on column public.bookings.calcom_status is 'Latest status reported by Cal.com';
comment on column public.bookings.calcom_last_event is 'Latest processed Cal.com webhook trigger';
comment on column public.bookings.calcom_last_event_at is 'Timestamp of the latest processed Cal.com webhook';

-- Run this in your Supabase project's SQL Editor (Project → SQL Editor → New query).
-- This is an ADDITION to supabase/schema.sql — run it after that file, not instead of it.
--
-- Creates a public-facing view of mentors that:
--   1. Only shows mentors you've manually approved (status = 'approved')
--   2. Never exposes a mentor's email address to site visitors
-- The mentors directory page reads from this view, not the raw `mentors` table.

create or replace view mentors_public as
select
  id,
  name,
  linkedin_url,
  expertise,
  availability,
  calendly_url
from mentors
where status = 'approved';

-- Allow the public anon key to read (but not write) this view.
grant select on mentors_public to anon;

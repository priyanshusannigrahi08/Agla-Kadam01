# AglaKadam

*Agla kadam* — Hindi for "next step."

A mentorship marketplace for people between chapters — students, graduates,
and career switchers — to find a mentor, explore their experience, and book a
30-minute guidance call.

**Live demo:** https://agla-kadam.vercel.app/

## What the current app does

- Guided mentor matching at `/find-mentor`
- Search, filtering and sorting at `/mentors`
- Public mentor profiles at `/mentors/[id]`
- External calendar booking with a dashboard record at `/book/[id]`
- Published mentor reviews at `/review`
- Email/authentication flows through Supabase
- Optional AI mentor guidance
- Mentor and mentee profile forms with profile photos
- Cal.com webhook synchronization for booking status and scheduled time

The mentor directory only exposes mentors whose Supabase `status` is
`approved`. Reviews are submitted as `pending` and should be published only
after they are reviewed/approved.

## Tech stack

- Next.js 16 (App Router) — deployed on Vercel
- Supabase — Postgres, Auth, Storage and row-level security
- Tailwind CSS
- TypeScript
- Cal.com — external scheduling and booking webhooks

## Running locally

```bash
git clone https://github.com/priyanshusannigrahi08/Agla-Kadam01.git
cd Agla-Kadam01
npm install
cp .env.example .env.local
# Fill in the Supabase, Gemini and Cal.com values in .env.local.
npm run dev
```

Open http://localhost:3000.

## Environment variables

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CALCOM_WEBHOOK_SECRET=your_calcom_webhook_secret
```

`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CALCOM_WEBHOOK_SECRET` are
server-side secrets. Never expose them as `NEXT_PUBLIC_` variables or commit
real values to the repository.

## Supabase setup

Run the SQL scripts in this order in the Supabase SQL Editor:

1. [`supabase/schema.sql`](./supabase/schema.sql) — creates the base
   `mentors` and `mentees` tables and baseline RLS.
2. [`supabase/platform_upgrade.sql`](./supabase/platform_upgrade.sql) — adds
   the current mentor/mentee fields, reviews, bookings, the canonical public
   mentor projection table, ownership policies, review eligibility checks, and
   the `profile-photos` storage bucket/upload policy.
3. [`supabase/production_hardening.sql`](./supabase/production_hardening.sql) —
   tightens grants, auth foreign keys, storage/booking/review access, external
   URL constraints, duplicate protection, and default privileges. Its legacy-
   safe `NOT VALID` constraints allow old data to be cleaned up separately.
4. [`supabase/calcom_integration.sql`](./supabase/calcom_integration.sql) — adds
   nullable Cal.com booking identifiers/status fields and indexes. It is
   backward-compatible with existing booking rows.

`mentors_public` is a dedicated projection table, not a public SQL view. A
trigger keeps it synchronized with approved mentors while keeping private
mentor fields out of the public Data API.

To publish a mentor, change their `mentors.status` from `pending` to
`approved` in the Supabase Table Editor.

### Cal.com webhook setup

Create a Cal.com webhook pointing to:

```text
https://YOUR-VERCEL-DOMAIN/api/webhooks/calcom
```

Use a webhook secret and subscribe to `BOOKING_CREATED`, `BOOKING_REQUESTED`,
`BOOKING_RESCHEDULED`, and `BOOKING_CANCELLED`. Put the same secret in
`CALCOM_WEBHOOK_SECRET` in Vercel. The endpoint verifies the
`X-Cal-Signature-256` HMAC before processing the payload.

The webhook stores the Cal.com booking UID/ID, provider status, event type and
scheduled start time in `bookings`. It also handles reschedules and
cancellations. For the current backward-compatible booking flow, it can
conservatively correlate a webhook to an existing active booking using the
Cal.com attendee email and mentor organizer email when provider identifiers
have not yet been stored.

Cal.com webhook payloads are versioned, so the handler intentionally reads the
stable booking fields documented by Cal.com rather than depending on an
undocumented payload shape.

### Booking and review trust model

AglaKadam currently uses an external booking service. The existing `/book/[id]`
flow remains available: the mentee can open the mentor's external calendar and
then record the booking in AglaKadam. That local record starts as `requested`.
When a valid Cal.com webhook is received and matched, the server can move it to
`confirmed`/`requested` and save `scheduled_for`; cancellations are synchronized
too. The external calendar remains the source of truth for the appointment.

A review can only be inserted by the signed-in user who owns the review, must
be `pending` on insertion, and must have a recorded completed booking for that
mentor. Published reviews are publicly readable, while browser clients cannot
update or delete reviews or booking records.

## Deployment

Connect this repo to Vercel and add the same environment variables in
**Project Settings → Environment Variables**. Pushes to `main` can then deploy
automatically.

After deployment, register the Vercel webhook URL in Cal.com and use the same
secret in both systems.

## Project structure

```text
app/
  page.tsx
  find-mentor/page.tsx
  mentors/page.tsx
  mentors/[id]/page.tsx
  book/[id]/page.tsx
  review/page.tsx
  dashboard/page.tsx
  ai-mentor/[id]/page.tsx
  api/ai-mentor/chat/route.ts
  api/webhooks/calcom/route.ts
  mentor/page.tsx
  mentee/page.tsx
  auth/page.tsx
components/
  FeaturedMentors.tsx
lib/
  supabaseClient.ts
  supabaseAdmin.ts
  profilePhoto.ts
supabase/
  schema.sql
  platform_upgrade.sql
  production_hardening.sql
  calcom_integration.sql
```

## Roadmap

- [x] Browsable mentor marketplace
- [x] Guided mentor matching
- [x] Public mentor profiles
- [x] External booking flow + dashboard records
- [x] Reviews with database-level eligibility checks
- [x] Profile photo storage
- [x] AI mentor request validation and basic rate limiting
- [x] Cal.com webhook receiver and booking synchronization
- [ ] Metadata-first booking correlation for the new booking flow
- [ ] Admin dashboard for mentor/review approval
- [ ] Distributed AI rate limiting and usage quotas
- [ ] In-app scheduling

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

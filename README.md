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

The mentor directory only exposes mentors whose Supabase `status` is
`approved`. Reviews are submitted as `pending` and should be published only
after they are reviewed/approved.

## Tech stack

- Next.js 16 (App Router) — deployed on Vercel
- Supabase — Postgres, Auth, Storage and row-level security
- Tailwind CSS
- TypeScript

## Running locally

```bash
git clone https://github.com/priyanshusannigrahi08/Agla-Kadam01.git
cd Agla-Kadam01
npm install
cp .env.example .env.local
# Fill in the Supabase and Gemini values in .env.local.
npm run dev
```

Open http://localhost:3000.

## Environment variables

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

`GEMINI_API_KEY` is server-side only. Never expose it as a
`NEXT_PUBLIC_` variable or commit a real secret to the repository.

## Supabase setup

Run the SQL scripts in this order in the Supabase SQL Editor:

1. [`supabase/schema.sql`](./supabase/schema.sql) — creates the base
   `mentors` and `mentees` tables and baseline policies.
2. [`supabase/platform_upgrade.sql`](./supabase/platform_upgrade.sql) — adds
   the current mentor/mentee fields, reviews, bookings, the canonical
   `mentors_public` view, authenticated ownership policies, review eligibility
   checks, and the `profile-photos` storage bucket/upload policy.

**Important:** `platform_upgrade.sql` is now the canonical upgrade script.
[`supabase/mentors_public_view.sql`](./supabase/mentors_public_view.sql) is kept
only as a legacy reference; do not use it instead of the platform upgrade
script for a fresh current setup.

To publish a mentor, change their `mentors.status` from `pending` to
`approved` in the Supabase Table Editor.

### Booking and review trust model

AglaKadam currently uses an external booking service such as Calendly. The app
records a booking only after the signed-in mentee clicks the confirmation
button; it does **not** verify the external calendar event. The database calls
this a `requested` booking rather than claiming it is externally confirmed.

A review can only be inserted by the signed-in user who owns the review, must
be `pending` on insertion, and must have a recorded booking for that mentor.
This protects review integrity at the database layer as well as in the UI.

For production-grade calendar verification, add a provider webhook/API
integration before treating bookings as completed or confirmed.

## Deployment

Connect this repo to Vercel and add the same environment variables in
**Project Settings → Environment Variables**. Pushes to `main` can then deploy
automatically.

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
  mentor/page.tsx
  mentee/page.tsx
  auth/page.tsx
components/
  FeaturedMentors.tsx
lib/
  supabaseClient.ts
  profilePhoto.ts
supabase/
  schema.sql
  platform_upgrade.sql
  mentors_public_view.sql  # legacy reference
```

## Roadmap

- [x] Browsable mentor marketplace
- [x] Guided mentor matching
- [x] Public mentor profiles
- [x] External booking flow + dashboard records
- [x] Reviews with database-level eligibility checks
- [x] Profile photo storage
- [ ] Verified calendar/webhook integration
- [ ] Admin dashboard for mentor/review approval
- [ ] Rate limiting and usage quotas for the AI mentor endpoint
- [ ] In-app scheduling

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

# AglaKadam

*Agla kadam* — Hindi for "next step."

A no-frills matchmaking site for people between chapters — college dropouts,
final-year students, and career switchers — to get matched with a mentor and
book a single guidance call.

**Live demo:** _add your Vercel URL here once deployed_

## Why this exists

Most career guidance is either a paid course or a cold LinkedIn message that
never gets a reply. AglaKadam does one thing: collect what someone's stuck
on, hand-match them with a mentor whose path is close to theirs, and get them
on a 30-minute call. No algorithm, no chat product, no payments — on purpose,
at this stage.

## How it works

1. A mentee fills out a short form describing their situation and what
   they're stuck on.
2. A mentor fills out a separate form with their background and a booking
   link (Calendly or similar).
3. Both are stored in Supabase. Right now, matching is done by hand — a
   human reads both tables and decides who to introduce.
4. The mentee gets an email with the mentor's name and booking link, and
   books a call directly.

This is deliberately manual at small scale — see [Roadmap](#roadmap) for what
gets automated as usage grows.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) — deployed on [Vercel](https://vercel.com/)
- [Supabase](https://supabase.com/) — Postgres database + row-level security, free tier
- [Tailwind CSS](https://tailwindcss.com/) — styling
- TypeScript throughout

## Running locally

```bash
git clone https://github.com/your-username/aglakadam.git
cd aglakadam
npm install
cp .env.example .env.local
# fill in .env.local with your own Supabase project's URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key** into `.env.local`
3. Go to the **SQL Editor** and run the contents of
   [`supabase/schema.sql`](./supabase/schema.sql) — this creates the
   `mentees` and `mentors` tables with row-level security already
   configured (the public key can insert signups but can't read other
   people's data back out)
4. Then run [`supabase/mentors_public_view.sql`](./supabase/mentors_public_view.sql) —
   this creates a read-only view of *approved* mentors (with email
   addresses excluded) that powers the public `/mentors` directory page.
   To make a mentor show up there, open the `mentors` table in Supabase's
   Table Editor and change their `status` from `pending` to `approved`.

### Deploying

Connect this repo to Vercel, add the same two environment variables in
**Project Settings → Environment Variables**, and every push to `main`
deploys automatically.

## Project structure

```
app/
  page.tsx           # Landing page
  mentee/page.tsx    # Mentee signup form
  mentor/page.tsx    # Mentor signup form
  thank-you/page.tsx # Post-submit confirmation
lib/
  supabaseClient.ts  # Supabase client setup
supabase/
  schema.sql         # Database schema + RLS policies
```

## Roadmap

- [x] Manual signup + hand-matching (current stage)
- [x] Browsable mentor directory with search (`/mentors`)
- [ ] Admin view for reviewing and matching signups without opening
      Supabase directly
- [ ] Rule-based auto-matching on tags/interests
- [ ] In-app scheduling instead of external Calendly links
- [ ] Progressive Web App (installable, no app store needed)
- [ ] Native app — only once retention data justifies the investment

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

# Contributing

Thanks for considering it. This project is intentionally small right now — the
matching itself is done by hand, not by code, so most of what's here is the
signup flow and the data model behind it.

## Local setup

1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env.local` and fill in your own Supabase project's
   URL and anon key (create a free project at supabase.com if you don't have one)
3. In your Supabase project's SQL Editor, run the contents of
   `supabase/schema.sql` to create the `mentees` and `mentors` tables
4. `npm run dev` and open `http://localhost:3000`

## Before opening a PR

- `npm run lint` and `npm run build` should both pass
- Keep changes focused — this project deliberately avoids scope creep (no
  chat, payments, or auto-matching yet; see the README roadmap for why)

## Reporting problems

Open an issue with what happened and, if it's a bug, how to reproduce it.

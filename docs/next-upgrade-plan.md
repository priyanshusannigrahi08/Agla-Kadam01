# AglaKadam — Next Upgrade Plan

## Smart Mentor Matching Onboarding

Goal: let a user describe their situation once, capture a small amount of structured context, and receive AI-ranked human mentor matches before starting an AI mentor conversation.

### User flow
1. User opens `/find-mentor`.
2. User explains what they are trying to figure out.
3. Optional structured fields: career stage, area, and goal.
4. App sends the context to the server-side matcher.
5. Server fetches the published mentor pool from `mentors_public` and performs AI matching.
6. Show up to 3 matches with fit label + concise reason.
7. User can view a profile, book a call, or continue with an AI mentor.

### Production requirements
- Server owns the mentor dataset; do not trust mentor profiles supplied by the browser for ranking.
- Debounce/submit-on-action rather than calling Gemini on every keystroke/message.
- Keep previous matches visible while refreshing.
- Use qualitative fit labels instead of implying percentage precision.
- Provide a deterministic fallback when Gemini is unavailable.
- Never expose private mentor fields; only query `mentors_public`.
- Keep API limits and input-length limits consistent with the existing AI endpoints.

### Acceptance criteria
- Empty mentor pool produces an honest empty state, never fabricated recommendations.
- Data analytics, software, finance, career uncertainty, and sports analytics scenarios produce sensible top matches.
- Reasons are grounded in fields actually present in the mentor profile.
- Invalid/unknown mentor IDs from the model are discarded.
- AI failure falls back gracefully to deterministic matching.

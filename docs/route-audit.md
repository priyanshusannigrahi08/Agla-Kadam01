# AglaKadam route audit

Audited from the `app/` route tree and repository source links. API routes, layouts, `sitemap.ts`, `robots.ts`, and other non-page files are excluded. “Internal link” means a source-code `href`/navigation reference to the route was found or the route is an expected continuation of an existing flow.

| Route | Main nav/footer | Internal link | Status |
|---|---|---|---|
| `/admin` | No | No clear public link | ⚠️ Orphaned/private admin route |
| `/ai-history` | No | Yes — AI mentor/history flow | Linked |
| `/ai-mentor` | Yes | Yes | Linked |
| `/ai-mentor/[id]` | No | Yes — AI mentor hub/history | Linked |
| `/articles` | Yes | Yes | Linked |
| `/articles/[slug]` | No | Yes — article cards | Linked |
| `/auth` | Yes via footer/AuthButton | Yes — sign-in flows | Linked |
| `/auth/callback` | No | System callback route | System route |
| `/book/[id]` | No | Yes — mentor cards/profile/office hours | Linked |
| `/career-map` | No | Yes — journey/navigation surfaces | Linked |
| `/career-memory` | No | Yes — journey/career workflow | Linked |
| `/career-navigator` | No | Yes — JourneyLauncher / discovery workflow | Linked |
| `/conversation/[booking-id]` | No | Yes — completed booking/review flow | Linked |
| `/dashboard` | Yes via footer/AuthButton | Yes | Linked |
| `/decision-room` | No | Yes — journey/navigation surfaces | Linked |
| `/discovery` | No | Yes — discovery workflow | Linked |
| `/find-mentor` | Yes | Yes | Linked |
| `/goals` | No | Yes — next-step/dashboard flow | Linked |
| `/group-conversations` | No | Yes — mentor marketplace/discovery | Linked |
| `/journey` | No | Yes — journey navigation | Linked |
| `/mentee` | No | Yes — onboarding/profile flow | Linked |
| `/mentor` | Yes | Yes | Linked |
| `/mentor/dashboard` | No | Yes — mentor account flow | Linked |
| `/mentor/dashboard/guide` | No | Yes — mentor dashboard guide | Linked |
| `/mentor/evidence` | No | Yes — mentor dashboard/evidence flow | Linked |
| `/mentors` | Yes | Yes | Linked |
| `/mentors/[id]` | No | Yes — marketplace/profile cards | Linked |
| `/next-step` | No | Yes — dashboard next-step flow | Linked |
| `/office-hours` | No | Yes — mentor marketplace | Linked |
| `/onboarding` | No | Yes — dashboard onboarding prompt | Linked |
| `/profile-setup` | No | Yes — dashboard/profile flow | Linked |
| `/progress` | No | Yes — dashboard/progress workflow | Linked |
| `/recommendations` | No | Yes — dashboard | Linked |
| `/reflection` | No | Yes — post-conversation/journey workflow | Linked |
| `/review` | No | Yes — completed booking flow | Linked |
| `/review/success` | No | Yes — review completion flow | Linked |
| `/settings` | No | Yes — account/settings flow | Linked |
| `/similar-journey` | No | Yes — recommendations/journey flow | Linked |
| `/stories` | No | Yes — mentor discovery flow | Linked |
| `/thank-you` | No | No clear current internal link | ⚠️ Orphaned candidate |
| `/updates` | No | Yes — dashboard/updates surface | Linked |

## Notes

- The audit intentionally does **not** delete or modify any route.
- `/auth/callback` is a system callback rather than a normal discovery route.
- `/admin` is expected to be private; its lack of public navigation is intentional.
- `/thank-you` is the clearest route that appears to have no current source-code navigation path and should be reviewed by a human before deciding whether to keep it.
- Some routes are reached as part of authenticated flows rather than the main navigation, so “not in nav/footer” does not mean “unused.”

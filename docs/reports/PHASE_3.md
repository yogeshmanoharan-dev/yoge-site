# Phase 3 database and backend

On 21 November 2026 the D1 migration and backend were deployed to the preview Worker. The production database and Worker are reserved for the launch phase.

## Implementation

The migration defines all 14 tables in §6. The local seed inserts approved copy, two published social profiles and empty unpublished profiles. Preview received only the 10 settings and two verified profiles. The seed preserves existing edits.

The contact action validates and stores a message. The newsletter action normalizes the address, records consent and returns the same public response to repeated signups. Email delivery is disabled on preview. The optional email path supports hashed confirmation and unsubscribe tokens and seven-day confirmation expiry.

Both actions check origin, honeypot, Turnstile and an atomic five-attempt hourly rate limit. The daily keyed hash keeps raw IP addresses out of D1. Health, published redirects, aggregate counters, security headers, request IDs and daily retention cleanup run in the Worker. The review form is available under `/styleguide/forms` in local and preview builds.

## Recorded checks

| Command or check                                                                                | Observed result                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run db:migrate:local`                                                                      | 35 commands executed successfully. Migration 0000 applied.                                                                                                                                                                                                                   |
| `npm run db:seed`                                                                               | 25 statements executed successfully.                                                                                                                                                                                                                                         |
| `drizzle-kit check` and repeat generation                                                       | Schema check passed. No additional migration generated.                                                                                                                                                                                                                      |
| `npm run check`                                                                                 | 60 files checked with 0 errors, warnings or hints. Lint and formatting passed, 4 deployment guard tests and 44 contrast tests passed, local build completed.                                                                                                                 |
| `npm run test:backend`                                                                          | 4 test files, 18 tests passed.                                                                                                                                                                                                                                               |
| `node tests/integration/backend.mjs` after local build                                          | Passed. Compiled Worker handled health before and after migration, contact writes, refused form submissions, repeat signups, rate limits, redirect counts and scheduled retention against isolated local D1. Siteverify responses were simulated for these automated checks. |
| `npm run test:production`                                                                       | PASS: production routes and bundles exclude design review pages and draft markers.                                                                                                                                                                                           |
| `npm audit --omit=dev`                                                                          | 0 vulnerabilities in the production dependency tree. The full npm installation reported 11 moderate advisories including development tools.                                                                                                                                  |
| `wrangler d1 migrations apply yoge-site-preview --remote --env preview --config wrangler.jsonc` | Applied 0000. Executed 35 commands.                                                                                                                                                                                                                                          |
| `node scripts/seed.mjs preview`                                                                 | Executed 12 statements. A separate read found 10 settings, 2 published profiles and 0 projects.                                                                                                                                                                              |
| `npm run build:preview` and `npm run deploy:preview`                                            | Deployed version `052609e9-b78c-4691-9a4d-e25d51ea3258`. Cloudflare reported the daily schedule `17 3 * * *` (03:17 UTC).                                                                                                                                                    |
| `npm run smoke -- https://yoge-site-preview.yoge-site.workers.dev`                              | PASS: HTML, identity, links, headers, no cookies, and stylesheet.                                                                                                                                                                                                            |
| GET `/api/health`, HEAD `/r/social/github`                                                      | Health returned HTTP 200 and database status ok. Redirect returned 302 to the verified GitHub profile.                                                                                                                                                                       |

Astro emitted its Shiki/CSP build warning. The site currently has no syntax-highlighted articles. Local tests exercised the scheduled event directly. The first timer-driven Cloudflare invocation has not been observed. Resend delivery was tested with a mock.

Both GitHub Actions jobs, `Check (windows-latest)` and `Check (ubuntu-latest)`, completed successfully for implementation commit `6da47c9cb1ad75c3e707b5611e3b6670408647a8`. Both jobs ran the backend tests and compiled Worker integration checks. Ubuntu ran the production dependency audit. [Implementation CI run](https://github.com/yogeshmanoharan-dev/yoge-site/actions/runs/44925536325).

## Hosted contact verification

**Passed on 21 November 2026.** Cloudflare’s managed widget verified the synthetic contact submission automatically. After submission, the preview displayed “Your message has been received.” Email delivery was disabled. [Preview form](https://yoge-site-preview.yoge-site.workers.dev/styleguide/forms).

Running `npx wrangler d1 execute yoge-site-preview --env preview --remote --config wrangler.jsonc` with the following query returned one row.

```sql
SELECT id, status, created_at FROM messages
WHERE subject = 'Phase 3 preview acceptance 20261121';
```

| Message ID                           | Status | Created at (UTC)         |
| ------------------------------------ | ------ | ------------------------ |
| f57c8dde-a99d-4d07-bb28-0d89cf61ad5f | new    | 2026-11-21T16:53:37.821Z |

The technical acceptance checks are complete. Phase 4 awaits Yoge’s approval.

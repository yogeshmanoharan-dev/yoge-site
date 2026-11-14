# Phase 1 — skeleton and preview deployment

Date: 2026-11-14. Phase 0 was explicitly approved by Yoge.

## Outcome

- [Live HTTPS preview](https://yoge-site-preview.yoge-site.workers.dev) loads the
  responsive hello page. Production has not been deployed.
- Astro 7.4.12, TypeScript strict, Cloudflare adapter 14.4.8, React integration,
  CSS tokens, original SVG decoration, and verified GitHub/LinkedIn links.
- Separate local, preview, and production D1 bindings; both remote databases
  created in APAC. No application schema yet (Phase 3).
- [First CI run](https://github.com/yogeshmanoharan-dev/yoge-site/actions/runs/43617816608)
  succeeded on Windows and Ubuntu for application commit `db4b74d`.
- Exact dependency versions, committed lockfile, monthly grouped Dependabot
  updates, and guarded local deployment commands.
- Cloudflare billing UI showed **Workers Free — Active** and **No payment method
  on file**. No paid resources, R2, Zero Trust, or card were added.

## Commands and observed results

Commands used the project-local Node 26.13.1 and npm 11.20.0. Wrangler was 4.162.0.
Telemetry was disabled. Wrangler logs and generated build output are ignored.

| Command                                                             | Result                                                                                                    |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm install --no-audit`                                            | Installed the initial 413 packages; successful                                                            |
| `npm install --save-dev --save-exact @types/node@26.6.6 --no-audit` | Added the required Node type definitions; successful                                                      |
| `npm run typecheck`                                                 | `Result (11 files): 0 errors, 0 warnings, 0 hints`                                                        |
| `npm run lint`                                                      | ESLint passed; `All matched files use Prettier code style!`                                               |
| `npm run test:deploy`                                               | `tests 4`, `pass 4`, `fail 0`                                                                             |
| `npm run build`                                                     | `Server built` and `Complete!`                                                                            |
| `npm run build:preview`                                             | Preview configuration built successfully                                                                  |
| `node scripts/deploy.mjs preview check`                             | `Validated preview: yoge-site-preview with its own D1 database.`                                          |
| `npm run deploy:preview`                                            | Deployed `yoge-site-preview`; returned the live URL above                                                 |
| `npm run smoke -- http://127.0.0.1:4321`                            | `PASS`: HTML, identity, links, headers, no cookies, and stylesheet                                        |
| `npm run smoke -- https://yoge-site-preview.yoge-site.workers.dev`  | `PASS`; also asserts the deployed hello page has no script elements                                       |
| `npm audit --omit=dev --json`                                       | 0 vulnerabilities                                                                                         |
| `npm audit --json`                                                  | 7 moderate development dependency findings, all rooted in the minimatch advisory recorded in DECISIONS.md |
| `git diff --check`                                                  | No whitespace errors                                                                                      |
| SHA-256 of `docs/BUILD_SPEC.md`                                     | `BD900E29BFBBBFBC8D193D5A324B640B29A985781422E2AFF20FFB14C8000D13`, unchanged                             |

`npm run upload:preview` also returned version
`b1822db7-986f-42a7-8a63-1365844fb0b9` and an
[immutable version URL](https://b1822db7-yoge-site-preview.yoge-site.workers.dev).
Cloudflare returns `X-Robots-Tag: noindex` on version URLs; the smoke check accepts
that header and separately requires the page's `noindex, nofollow` meta tag.

The four deployment tests cover preview/production D1 isolation, exact production
approval, stale build markers/wrong Worker names/extra bindings, and rejection of
local or unknown deployment targets. No production deployment was used to test
the gate.

Cloudflare setup commands:

```text
npx --no-install wrangler login --device --browser=false --scopes account:read user:read workers:write workers_scripts:write d1:write
  Successfully logged in.
npx --no-install wrangler d1 list --json
  [] before creation
npx --no-install wrangler d1 create yoge-site
  Successfully created DB 'yoge-site' in region APAC
npx --no-install wrangler d1 create yoge-site-preview
  Successfully created DB 'yoge-site-preview' in region APAC
npx --no-install wrangler d1 execute DB --config wrangler.jsonc --local --command 'SELECT 1 AS connected'
  connected: 1; local sentinel database
npx --no-install wrangler d1 execute DB --env preview --remote --command 'SELECT 1 AS connected'
  connected: 1; changes: 0; rows_written: 0
npx --no-install wrangler d1 execute DB --env production --remote --command 'SELECT 1 AS connected'
  connected: 1; changes: 0; rows_written: 0
```

## Browser review

- Reviewed the layout at 320, 375, 768, 1280, and 1920 viewport widths; no
  horizontal overflow observed. Saved live desktop and mobile screenshots in the
  ignored `.cache/` directory for the owner handoff.
- Keyboard Tab exposes the visible skip link; Enter moves focus to `main-content`.
- Live HTML contains the name, introduction, and real profile links without any
  client script elements. The decorative fold is inline SVG, not WebGL.
- Live preview browser logs had no warnings or errors.
- No visitor cookie is set. `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and
  `X-Robots-Tag: noindex, nofollow` were checked over HTTPS.

## Failures encountered and resolved

1. The first Wrangler OAuth callback expired while the owner signed in. The
   browser then showed a localhost connection error. Device authorization avoided
   that callback, and the CLI confirmed success.
2. The local sandbox blocked Workers runtime type generation and loopback HTTP.
   Re-running the authorized checks outside that restriction passed.
3. The initial Astro helper used the old CLI path. Astro 7's package manifest
   declares `bin/astro.mjs`; correcting that path made builds pass.
4. The new workers.dev hostname initially failed its TLS handshake while Cloudflare
   provisioned it. A later check passed with normal TLS verification.
5. The version-URL smoke check initially expected the stable URL's exact robots
   header. Cloudflare version URLs return `noindex`; the check now requires that
   directive plus the page's full robots meta tag.

## Scope and remaining verification

- This is the Phase 1 hello page. Fonts, component specimens, automated color
  contrast checks, and the design approval belong to Phase 2.
- Backend actions, migrations, admin login, content pages, 3D, and the complete
  cross-browser/accessibility/performance suites have not been built or claimed
  as tested. They remain in the specified later phases.
- GitHub Actions checks builds; deployment currently uses the local guarded CLI.
  GitHub deployment secrets, PR preview comments, production reviewer settings,
  and migration automation from §15 still need setup and rehearsal before launch.
- Production deployment and rollback were not run. An explicit owner
  **"yes, deploy"** is still required for production.
- The development-only minimatch advisory remains tracked for a compatible fix.

## Owner review gate

Open the live preview on a phone and laptop. Check the hello page, name, and
profile links. Phase 2 starts only after Yoge approves Phase 1.

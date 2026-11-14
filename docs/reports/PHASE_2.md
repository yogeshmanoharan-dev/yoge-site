# Phase 2 — design system review

Date: 2026-11-14. Yoge explicitly approved Phase 1.

## Delivered

- [Styleguide](https://yoge-site-preview.yoge-site.workers.dev/styleguide): color,
  typography, spacing, 12/4-column grid, original paper texture, light/dark surfaces,
  Button, Card, Badge/Status, Chip, Input, Textarea, Toast, Modal, Tabs, and SocialTile.
- [Type A](https://yoge-site-preview.yoge-site.workers.dev/styleguide/type-a):
  Fraunces + Inter + JetBrains Mono, 122,204 bytes.
- [Type B](https://yoge-site-preview.yoge-site.workers.dev/styleguide/type-b):
  Instrument Serif + Geist + JetBrains Mono, 90,836 bytes.
- Exact §2.3 draft headlines, sub-line, about paragraphs, and CTA labels presented
  for approval. No invented projects, reviews, achievements, or profile URLs.
- Review pages excluded from production. The homepage adopts the owner's selected
  Font B and Hero B in the selection follow-up.
- Sources, OFL licenses, SHA-256 hashes, and font choices recorded in FONTS.md.

## Verification performed

| Command/check                                                                                | Observed result                                                                                           |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                                                          | `Result (29 files): 0 errors, 0 warnings, 0 hints`                                                        |
| `npm run lint`                                                                               | ESLint passed; `All matched files use Prettier code style!`                                               |
| `npm run test:deploy`                                                                        | 4 pass, 0 fail                                                                                            |
| `npm run test:contrast`                                                                      | 44 pass, 0 fail; lowest text 4.705:1, control boundary 3.781:1                                            |
| `npm run build`                                                                              | `Complete!`                                                                                               |
| `npm run test:production`                                                                    | `PASS: production routes and bundles exclude design review pages and draft markers.`                      |
| `wrangler dev --config dist/server/wrangler.json --local --port 4322` after production build | Root 200; `/styleguide`, `/styleguide/type-a`, `/styleguide/type-b` each 404                              |
| `npm run build:preview`                                                                      | `Complete!`                                                                                               |
| `npm run deploy:preview`                                                                     | Deployed preview version `f3b2b4cd-f365-4660-8bdd-5f1797ba3f25`                                           |
| `npm run smoke -- https://yoge-site-preview.yoge-site.workers.dev`                           | PASS: HTML, identity, links, headers, no cookies, and stylesheet                                          |
| HTTP requests to all three live review routes                                                | 200 and noindex                                                                                           |
| Font inspection                                                                              | WOFF2 signatures, internal family names/weight axes, hashes, OFL licenses, and both font budgets verified |

CI now includes contrast and production-exclusion checks on Windows and Ubuntu.
The exact completed run is linked in the owner handoff; workflow history is
[available here](https://github.com/yogeshmanoharan-dev/yoge-site/actions/workflows/ci.yml).

## Browser review

- Gallery and both type specimens rendered at 375, 768, 1280, and 1920 widths.
  Gallery additionally checked at 320. No horizontal overflow found.
- Full-page live screenshots for all three routes at all four required widths
  saved as `.cache/phase-2-*.jpg`; the font hero captures are included in handoff.
- Modal open/close, Tab/Shift+Tab cycling, Escape, and opener focus restoration
  verified. The deployed modal was retested after upload.
- Toast displayed the clearly labeled preview message in its polite live region;
  dismiss worked. No data was saved or transmitted by the specimens.
- Tabs responded to arrow-key navigation and exposed the selected panel.
- Visible labels, hints, inline errors, disabled controls, and text status badges
  reviewed on cream and charcoal. Initial HTML retains the content and links.
- Deployed custom elements initialized successfully; browser logs contained no
  warnings or errors during the final review.

## Corrections during review

1. A native dialog Tab boundary could move focus to the document body. Added
   explicit focus cycling and initial focus; verified both directions and Escape.
2. Narrowed the specimen hero paragraph selector so it does not enlarge the font
   comparison note. Fixed flow spacing specificity and grid content alignment.
3. Astro now inlines the small hello-page stylesheet. Updated its smoke check to
   verify either external CSS or actual inline hello-layout CSS; the page passes.

## Limits and owner gate

This phase does not claim full WCAG certification, a screen-reader audit, or the
later Playwright three-engine/Lighthouse suite. Core content is present in server
HTML; a dedicated browser JavaScript-off run remains for the full page phase.
No production deployment, database schema change, or new application dependency
was made. The existing development-only dependency advisory from Phase 1 remains
tracked; unrelated dependencies were not changed.

On 2026-11-14, Yoge selected **Font B — Instrument Serif + Geist**, with JetBrains
Mono for labels, and **Hero B — "Building with AI. Sharing what actually works."**
Instrument Serif is static 400 upstream, a documented exception to the
variable-font preference.

Yoge subsequently explicitly approved the §2.3 sub-line, both About paragraphs,
and CTA labels "Explore my work" and "Say hello". Font and copy approval is
complete; it should not be requested again. Phase 3 has not started.

## Selection follow-up validation

The selected fonts and hero copy are applied to the homepage and review defaults.
All approved copy is centralized in `src/lib/brand.ts` for the later pages and
database seed. The current hello page keeps its working GitHub CTA until the
approved full-page CTA destinations are implemented.

- `npm run format` passed.
- `npm run check` passed: 30 files checked, zero errors, warnings, or hints;
  lint passed; all 4 deployment guard tests and 44 contrast tests passed; build
  completed.
- `npm run test:production` passed: production routes and bundles exclude review
  pages and draft markers.
- `npm run build:preview` and `npm run deploy:preview` passed. Preview version:
  `1064c0fd-2c47-4114-9cc3-9f9da1f2abcb`.
- `npm run smoke -- https://yoge-site-preview.yoge-site.workers.dev` passed:
  HTML, identity, links, headers, no cookies, and stylesheet.
- Live homepage inspected at 320, 375, 768, 1280, and 1920 widths without horizontal
  overflow. The selected Instrument Serif rendered correctly. Desktop and mobile
  screenshots saved as `.cache/phase-2-selected-desktop.jpg` and
  `.cache/phase-2-selected-mobile.jpg`.

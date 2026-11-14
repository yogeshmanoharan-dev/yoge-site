# Phase 2 contrast and review-route checks

## Automated contrast coverage

Run `node --test scripts/contrast.test.mjs` with the project Node version.
The test reads six-digit opaque sRGB values directly from `src/styles/tokens.css`,
linearizes the channels, and compares unrounded contrast ratios. A reference test
ensures `#777777` on white remains a failure despite rounding to 4.5:1.

Supported text combinations require **4.5:1**, including small text:

- Ink and muted ink on paper or raised paper.
- Dark orange (`signal-ink`) on paper or raised paper.
- Ink on orange primary buttons, lavender tags, or paper-fold status badges.
- Muted ink on paper-fold disabled controls (an additional readability check).
- Muted purple on paper or raised paper.
- Paper, lavender, bright orange, and dark-muted text on charcoal.
- Error text on paper or raised paper; pale error text on charcoal.

Supported control boundaries and focus indicators require **3:1**:

- Strong borders on paper, raised paper, or charcoal.
- Dark-orange focus indicators on paper or raised paper.
- Bright-orange focus indicators on charcoal.

These checks cover named pairs, not arbitrary palette combinations. In particular,
do not place white text on the bright orange primary-button fill or assume that
muted-purple text passes on lavender. Decorative hairlines, paper facets, and
texture may use weaker contrast only when they convey no required information.
An additional hover or error style must use a tested pair or add its own test.
Opacity, images, gradients, and browser forced-colors behavior need separate visual
and interaction verification; a passing palette test alone is not a WCAG audit.

The suite also resolves the actual light/dark semantic aliases used by components:
`text`, `text-muted`, `feedback-error`, `surface`, `surface-raised`, and `focus`.
This catches incorrect theme mappings even when every raw palette color is sound.

## Observed contrast result

On 2026-11-14, after the Phase 2 color tokens were added:

```text
node --test scripts/contrast.test.mjs
tests 44
pass 44
fail 0
```

The lowest supported text ratio is muted purple on paper at **4.705:1**. Strong
field borders on charcoal measure **3.781:1**. Error text on paper measures
**6.131:1**; the dark error variant measures **9.374:1** on charcoal. ESLint and
Prettier pass for the test file and this document.

## Production exclusion review

The implementation keeps review-only source outside `src/pages` and injects its
routes only for local development and preview. It uses the explicit target
environment, not `NODE_ENV`, because both deployment builds use production
optimization. Route patterns are saved as strings for inspection.

Integration acceptance checks (performed separately from this contrast suite):

1. Build preview and verify `/styleguide` and each font specimen route render.
2. Build production locally, with no deployment approval and no deployment.
3. Inspect the produced route manifest and server/client bundles for review-only
   routes and a unique review-only content marker.
4. Serve that production build locally and request each review URL, including
   trailing-slash variants. Require HTTP 404, then require the public home page
   still returns HTTP 200.
5. Build preview again before uploading preview; the existing deployment wrapper
   rejects a build whose marker, APP_ENV, Worker name, or D1 binding mismatches.

Public font files can remain static assets without exposing a review page. Keep
sample content out of production source output, however, and do not import review
components from a shared layout used by public routes. Preview `noindex` is useful
for indexing but does not constitute access control.

The existing production deployment guard checks the exact owner approval phrase,
environment marker, Worker identity, and single expected D1 database. It does not
by itself prove review-route exclusion; the separate build/runtime checks above
are necessary.

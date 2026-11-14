# Portrait design revision — 14 November 2026

Yoge requested a more premium, professional design using his uploaded visual
references and portraits. This is a revision to the Phase 2 direction. Font B and
the approved hero, sub-line, About paragraphs, and CTA labels are retained.

## Direction and scope

- Neutral off-white `#F1F0EB`, raised white `#FAF9F6`, ink `#141312`,
  charcoal `#1E1D1C`, and signal orange `#FF5A1F`.
- Instrument Serif headlines, Geist text and navigation, existing JetBrains Mono
  for design-system labels.
- An asymmetric editorial cover: left-aligned headline and right-side monochrome
  portrait overlap one orange band. On mobile they form a single vertical sequence.
- Approved About copy and the warm desk portrait give the design a personal second
  section. A charcoal section contains working GitHub and LinkedIn links.
- No template or reference image is copied into the website. Only the two selected
  owner-supplied portraits are used. Their faces and appearance are unchanged.
- The hero's earlier SVG sculpture is replaced by the portrait. The future 3D
  treatment remains a later-phase decision; this change implements no backend.

Files changed: `src/pages/index.astro` for layout and content placement;
`src/styles/tokens.css` for the neutral palette; `BaseLayout.astro` for browser
theme colour; `base.css` for robust hidden skip-link clipping; `scripts/smoke.mjs`
to read the headline across semantic spans; responsive portraits and provenance
documentation; README and decision notes.

## Images and cost

Images are pre-encoded locally as responsive WebP files. No new dependency,
runtime image service, or paid product was added. Each largest image is below
116 KB; the 480-pixel variants are under 26 KB. The hero loads eagerly; the lower
photo loads lazily. Dimensions and responsive source candidates are explicit.
See [portrait provenance](../PORTRAITS.md).

This SSR review page uses native responsive images with pre-encoded files.
The existing Cloudflare adapter's compile service optimizes prerendered routes,
so no runtime image binding was introduced. See the
[official adapter image-service documentation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#imageservice).

## Validation

- `npm run check`: typecheck reported 30 files, zero errors/warnings/hints;
  lint passed; 4 deployment guard tests passed; 44 contrast tests passed; build
  completed.
- Palette minimum tested text contrast: 4.761:1. Minimum tested interface
  contrast: 3.781:1.
- Browser checks at 320, 375, 768, 1280, and 1920 widths: no horizontal overflow,
  images loaded, selected Instrument Serif rendered.
- About and Say hello links reached their sections. Skip link was visible on
  keyboard focus and moved focus to main content. Visible focus ring verified.
- Browser error/warning log was empty.
- A separate source review found no actionable content, asset, or accessibility
  defects. This is not a full screen-reader or Lighthouse audit.
- Screenshots: previous `.cache/phase-2-selected-{desktop,mobile}.jpg`; revised
  `.cache/redesign-desktop-1280.jpg` and `.cache/redesign-mobile-375.jpg`.
- `npm run test:production` passed: review routes and draft markers are excluded.
- `npm run build:preview` and `npm run deploy:preview` passed. Final preview
  version: `cb98ffbc-3e2c-48c0-985b-5cc34f5f76d2`.
- `npm run smoke -- https://yoge-site-preview.yoge-site.workers.dev` passed:
  HTML, identity, links, headers, no cookies, and stylesheet.
- Live browser verification confirmed both photographs, the selected headline,
  updated palette, and zero script elements. The live 375px layout has no
  horizontal overflow. Live screenshots: `.cache/redesign-live-desktop.jpg` and
  `.cache/redesign-live-mobile.jpg`.

Production remains undeployed. This revision is for the owner's visual review
before the next phase.

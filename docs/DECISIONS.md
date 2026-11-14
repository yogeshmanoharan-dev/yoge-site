# Decisions and implementation questions

## 2026-11-14 — source of truth and phase boundaries

- Preserve `BUILD_SPEC.md` exactly as supplied. Record clarifications here rather
  than silently rewriting it.
- `AGENTS.md` and `CLAUDE.md` contain the specification's agent rules.
- The request to start building authorizes the Phase 0 setup. The next phase
  still requires the review gate in specification §17.
- Use this existing workspace and the owner's own Cloudflare deployment flow.
  No Sites-hosted project or alternative hosting service is being provisioned.
- Never use R2, Zero Trust/Access, paid plans, or a credit card.
- Production deployment always requires the explicit phrase "yes, deploy".

## Environment verification

The installed tools and their actual command outputs are recorded in
[the Phase 0 report](reports/PHASE_0.md). Versions shown by a website are not
treated as locally installed or executable versions. Reconcile any difference
before choosing the Phase 1 toolchain.

The official release index confirmed Node 26.13.1 (Lithium LTS), published
2026-11-10, with npm 11.20.0. A project-local copy was installed and verified;
`.node-version` records that version. The machine's global Node was not changed.
Wrangler 4.162.0 was released 2026-11-13 and its npm metadata identifies the
license as MIT OR Apache-2.0. It was executed from an exact-version `npx` package
for Phase 0; the Phase 1 manifest will pin a checked local development dependency.

## Questions to resolve in their implementation phases

1. **Admin changes and static pages (Phase 5).** The Phase 1 foundation uses
   `output: 'server'`. Pages whose content is editable in D1 will render on demand
   so changes can appear without a rebuild and without client JavaScript. MDX
   articles and other Git-owned content can explicitly prerender. Finalize shared
   navigation/footer behavior in Phase 5; static HTML cannot reflect D1 edits
   without rebuilding.
2. **Newsletter tokens (Phase 3).** The schema in §6 has an unsubscribe token
   hash, but confirmation requires a separate token hash, expiry, and single-use
   consumption state. Add the required fields or a dedicated token table.
3. **Admin entry points (Phase 4).** `/admin/login` and `/admin/callback` need
   narrowly defined exceptions to the blanket `/admin/**` guard. Keep all data
   routes and mutations protected, and enumerate them in tests.
4. **Email social links (Phase 3).** `email` is an allowed platform, while the
   generic URL rule requires HTTPS. Define explicit `mailto:` validation for
   this platform, or keep it unpublished until a public email is provided.
   Never expose the private `ALERT_EMAIL_TO` secret as a public contact address.
5. **Resource path overlap (Phases 3 and 5).** Static files and detail pages both
   use `/resources/`. Reserve distinct file paths (for example a file extension
   or an assets subdirectory) so Worker routing cannot shadow a detail page.
6. **GitHub production approval (before launch).** Required environment reviewers
   are supported for this public repository. Allow owner self-review so a sole
   owner can release, while retaining the exact "yes, deploy" gate. Phase 1 tests
   the local deployment guard; the actual GitHub deployment environment, credentials,
   PR comments, migrations, and approval rehearsal remain to be configured before
   launch. The Phase 1 acceptance checks are CI and a live preview hello page.
7. **Workers Free CPU budget (Phases 3 and 8).** The current limits page lists
   10 ms CPU per request. Measure server rendering, validation, and authentication
   rather than assuming request-count limits alone prove free-tier suitability.
8. **GSAP licensing (Phase 6).** Verify the current official license and record
   free commercial-use permission before installing. Do not equate free-to-use
   automatically with an OSI-approved open-source license.

## 2026-11-14 — Phase 1 implementation choices

- Pin Astro 7.4.12, Cloudflare adapter 14.4.8, React integration 7.1.9, React/React
  DOM 19.3.1, and Wrangler 4.162.0 after checking official docs and npm metadata.
  Direct package versions are exact and the lockfile is committed. Their licenses
  allow free commercial use (MIT; Wrangler MIT OR Apache-2.0).
- Use TypeScript 6.0.3 (Apache-2.0), the latest compatible version checked at setup.
  TypeScript 7.0.2 was available, but the installed Astro checker supports ^5/^6
  and typescript-eslint requires <6.1. Do not force an unsupported major version.
- Set the Cloudflare image service to `compile` and disable Astro sessions for
  now. This avoids automatic Images/KV provisioning. Admin sessions will use D1.
  No R2, KV, paid Images binding, or Zero Trust service was created.
- Keep local, preview, and production bindings explicit. The adapter reads
  `CLOUDFLARE_ENV` at build time. Generated configuration plus a successful-build
  marker must match the requested target before a deployment can start.
- Use a dedicated preview Worker and preview D1. Creating the production D1 is
  authorized setup, not permission to deploy production. All Phase 1 pages are
  marked noindex in both HTML and response headers.
- Use a simple server-rendered hello page with CSS tokens and an original SVG
  fold. System fonts keep Phase 1 independent of the Phase 2 font-selection gate.
  React is integrated but no island is hydrated on this page.
- Use Wrangler device authorization after the localhost OAuth callback expired.
  The owner completed the browser authorization; the CLI reported a successful
  login. This uses the same limited account/user read, Workers write, and D1 write
  scope set as the initial request.
- Phase 1 CI builds on Windows and Linux with official actions pinned to verified
  commit SHAs. Deployment uses Wrangler locally for this gate; Cloudflare API
  tokens have not been placed in GitHub. The full §15 deployment automation must
  be completed and rehearsed before launch.
- Production dependency audit: zero vulnerabilities. The full development audit
  reports seven moderate affected packages rooted in one minimatch advisory,
  [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), through
  typescript-eslint. npm's suggested change downgrades the direct tooling package;
  it was not applied automatically. This dependency is not in the deployed Worker.
  Dependabot is enabled. Review a compatible upstream fix before Phase 8 hardening.

## 2026-11-14 — Phase 2 design system

- Follow the specification's Paper & Signal palette and editorial composition.
  Add semantic light/dark tokens so components can inherit readable colors.
  The 44 contrast checks enumerate supported combinations, including control
  boundaries, focus, errors, badges, and disabled labels; arbitrary color pairs
  are not claimed to pass AA.
- Compare Fraunces + Inter with Instrument Serif + Geist. Each specimen uses
  JetBrains Mono as its third family. All fonts are self-hosted Latin WOFF2 with
  OFL licenses. A weighs 122,204 bytes and B 90,836 bytes. Instrument Serif is
  static upstream; the other files retain variable weight. Fraunces optical size
  is fixed at 144 and Inter at 14 to keep the font budget. See FONTS.md.
- No final typeface or copy approval is inferred. The hello page keeps its
  Phase 1 fonts; comparisons and draft text live only on review routes.
- Review source is outside `src/pages` and conditionally injected using Astro's
  [integration API](https://docs.astro.build/en/reference/integrations-reference/).
  Production exclusion is verified in the resolved route list, emitted bundles,
  and actual local production HTTP responses (404 for all three review routes).
  Preview remains public/noindex; it contains no private data and is not an admin
  authentication surface.
- Modal, toast, and tabs use native HTML plus small custom elements. No new app
  dependency was added. Modal focus cycling explicitly handles browser boundary
  behavior observed during keyboard testing. Broader browser/screen-reader audits
  remain scheduled for hardening.
- The small original SVG paper texture is below 10 KB. It is decorative and
  contains no remote resources. Motion-heavy interactions remain in Phase 6/7.

## Privacy notice — to be reviewed before launch

The privacy notice must be reviewed before launch. This project does not claim
legal compliance. Confirm the actual data flows, deletion address, retention,
consent, and third-party services before publishing the notice.

## Primary references checked during setup

- [Node.js downloads](https://nodejs.org/en/download)
- [Node.js release support](https://nodejs.org/en/about/previous-releases)
- [Wrangler installation and requirements](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Cloudflare version URLs](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/)
- [GitHub repository security settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository)

Recheck service terms and exact dependency versions when each service or library
is introduced. Account setup and no-card availability are not verified by
reading a pricing page alone.

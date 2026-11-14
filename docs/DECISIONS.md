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

1. **Admin changes and static pages (Phases 1 and 5).** Prerendered `/about`,
   `/content`, and shared navigation/footer cannot reflect arbitrary D1 edits
   within a minute without a rebuild or request-time HTML. Choose an explicit
   strategy that preserves JS-off content and the promised editing behavior.
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
6. **GitHub production approval (Phase 1).** Check whether required reviewers
   work as intended for the owner who initiates the run; do not create a pipeline
   that waits for an unavailable second reviewer. Preserve explicit deployment
   approval and document the chosen mechanism.
7. **Workers Free CPU budget (Phases 3 and 8).** The current limits page lists
   10 ms CPU per request. Measure server rendering, validation, and authentication
   rather than assuming request-count limits alone prove free-tier suitability.
8. **GSAP licensing (Phase 6).** Verify the current official license and record
   free commercial-use permission before installing. Do not equate free-to-use
   automatically with an OSI-approved open-source license.

## Privacy notice — to be reviewed

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
- [GitHub repository security settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository)

Recheck service terms and exact dependency versions when each service or library
is introduced. Account setup and no-card availability are not verified by
reading a pricing page alone.

# Yogesh Manoharan — Yoge

The source repository for Yoge's personal website. The planned experience,
**Paper & Signal**, combines an editorial website with a decorative, scrolling
folded-paper sculpture, a Cloudflare backend, and a private admin dashboard.

## Current status

**Phase 1 — Astro skeleton and preview deployment, ready for owner review.**
The responsive hello page uses the Paper & Signal palette, an original SVG paper
fold, and verified profile links. Astro, strict TypeScript, React integration,
Cloudflare Workers, separate D1 environments, and CI are configured. The full
design system, database schema, admin, content pages, and 3D arrive in later phases.

Preview: [yoge-site-preview.yoge-site.workers.dev](https://yoge-site-preview.yoge-site.workers.dev).
This review site is marked `noindex`. Production has not been deployed.

Repository: [yogeshmanoharan-dev/yoge-site](https://github.com/yogeshmanoharan-dev/yoge-site).
CI runs typechecking, linting, deployment guard tests, and builds on Windows and
Linux. See [GitHub Actions](https://github.com/yogeshmanoharan-dev/yoge-site/actions/workflows/ci.yml).

- [Complete build specification](docs/BUILD_SPEC.md)
- [Agent rules](AGENTS.md)
- [Decisions and open implementation questions](docs/DECISIONS.md)
- [Setup and operations guide](docs/RUNBOOK.md)
- [Content guide](docs/CONTENT_GUIDE.md)
- [Phase 0 verification report](docs/reports/PHASE_0.md)
- [Phase 1 verification report](docs/reports/PHASE_1.md)

## Product

- A home page, biography, AI Lab, content hub, resources, social links, and Now/Uses pages.
- Real contact messages and newsletter interest stored in Cloudflare D1.
- A private dashboard accessible only to the allowed GitHub account.
- Core HTML content that works without JavaScript or WebGL.
- Motion preferences, responsive layouts, and WCAG 2.2 AA as implementation targets.

## Planned stack

Astro, strict TypeScript, React islands for 3D and complex widgets, Three.js,
GSAP, Lenis, plain CSS, MDX, Cloudflare Workers/D1/Turnstile, Drizzle, Zod,
and GitHub OAuth. Versions and licenses are checked before each dependency
is added; dependencies will use exact versions and a committed lockfile.

Budget: **₹0**, with free services requiring no credit card. R2, Zero Trust,
paid assets, paid fonts, and trials are excluded.

## Working on the project

Use Windows 11, PowerShell, Git, and Node.js LTS. Follow the environment notes
in the [runbook](docs/RUNBOOK.md) before installing dependencies. Application
commands use the Node version in `.node-version` and work in PowerShell or a
Unix shell:

```text
npm ci
npm run dev
npm run check
```

`npm run dev` starts `http://127.0.0.1:4321/` with local bindings. `npm run check`
runs typechecking, linting, four deployment guard tests, and the local build.
Deployment commands and environment checks are documented in the runbook.

Read `AGENTS.md` and the entire specification before each phase. Follow:
plan → implement → test → self-review → report → owner approval.
Never advance through a review gate automatically. Production deployment
requires Yoge's explicit **"yes, deploy"**.

## Content and privacy

Only facts approved in specification §2 may appear as personal claims.
Unpublished placeholders and development demo rows must never reach production.
Keep secrets in ignored `.dev.vars` files and service secret stores. Database
exports, contact messages, subscriber emails, and private credentials must not
be committed.

## License

Source code is licensed under MIT. Original copy, photos, branding, articles,
and other creative content remain © Yogesh Manoharan and are not covered by
the code license. Third-party assets retain their respective licenses.

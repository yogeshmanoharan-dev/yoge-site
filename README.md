# Yogesh Manoharan — Yoge

The source repository for Yoge's personal website. The planned experience,
**Paper & Signal**, combines an editorial website with a decorative, scrolling
folded-paper sculpture, a Cloudflare backend, and a private admin dashboard.

## Current status

**Phase 0 — environment and repository setup is in progress.**
This repository currently contains the specification, project rules, folder
structure, and setup documentation. The Astro application starts in Phase 1.
There is no running website or production deployment yet.

- [Complete build specification](docs/BUILD_SPEC.md)
- [Agent rules](AGENTS.md)
- [Decisions and open implementation questions](docs/DECISIONS.md)
- [Setup and operations guide](docs/RUNBOOK.md)
- [Content guide](docs/CONTENT_GUIDE.md)
- [Phase 0 verification report](docs/reports/PHASE_0.md)

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
commands will be documented when implemented in Phase 1; do not assume that
`npm run dev`, tests, or a build are available at Phase 0.

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

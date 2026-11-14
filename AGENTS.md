# Project rules: Yogesh Manoharan personal website

You are building and maintaining Yoge's personal website. Full spec: docs/BUILD_SPEC.md.
Read the whole spec before starting any phase. The spec wins over your assumptions.

## Zero-cost rule
- Use only free, open-source libraries and free-tier services that need NO credit card.
- Never add a paid service, a paid API, a paid font, a paid asset or a trial.
- Never use Cloudflare R2 or Cloudflare Zero Trust/Access (they may ask for a payment method).
- If something seems to require payment, STOP and tell Yoge. Do not work around it silently.

## Truth rule (most important)
- Never invent facts about Yoge: no fake projects, clients, numbers, testimonials, awards,
  employers, job titles, years of experience, follower counts or results.
- Verified identity facts are ONLY those in BUILD_SPEC.md §2. Use nothing else.
- Never use these titles for Yoge: "AI Engineer", "ML Engineer", "Software Engineer",
  "Developer" (as a job), "Founder", "Expert", "Consultant".
- Never describe Yoge as a beginner or "just starting".
- Projects shown on the site must come from the database, with an honest status
  (Idea / Researching / In development / Prototype / Live / Paused). Planned features are
  written as plans ("Planned: …"), never as finished work.
- Any placeholder content must be marked `TODO(yoge)` in code, stored as unpublished,
  and must NEVER appear on production.
- Never guess social profile URLs. Only show links Yoge entered or that are listed in §2.

## Process rules
- Work strictly phase by phase (BUILD_SPEC.md §17). For each phase:
  plan → implement → test → self-review → report → STOP for Yoge's approval.
- Before coding a phase, list the files you will create or change and why.
- Make small, focused commits using Conventional Commits (feat:, fix:, chore:, docs:, test:).
- Never commit secrets. Secrets live in `.dev.vars` (git-ignored) locally and in
  Cloudflare/GitHub secrets for production.
- Never deploy to production without Yoge typing an explicit "yes, deploy".
- Never touch any other repository (especially the private `the-colony` repo).
- Never claim something works unless you ran it. Report exactly which commands and tests
  you ran and what they printed. If you couldn't test something, say so.
- Prefer the simplest solution that meets the spec. No unnecessary dependencies.
- Pin dependency versions. Before adding a dependency, check it's maintained and its
  licence allows free commercial use.

## Environment rules
- Yoge uses Windows 11, VS Code, PowerShell, Git. All npm scripts must be cross-platform
  (no bash-only syntax; use node scripts or cross-platform tools).
- Explain new concepts briefly in plain English when you introduce them (Yoge is learning
  software engineering). Keep explanations short; the main goal is a working website.

## Quality bar
- Premium, original design (no copied templates or other people's sites).
- Every page must work without WebGL and without JavaScript for core content.
- WCAG 2.2 AA, Core Web Vitals in "Good" range, Lighthouse mobile ≥ 90 on content pages.
- TypeScript strict mode. Validate every input on the server with Zod.

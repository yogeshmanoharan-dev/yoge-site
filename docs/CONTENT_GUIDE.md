# Content guide

Status: initial editorial rules. Admin screens and MDX templates will be
documented when their schemas and interfaces are implemented in Phases 4–5.

## Identity and claims

Use specification §2 as the only source for personal claims. The approved name
is Yogesh Manoharan, creator name Yoge, based in India. The draft copy is still
subject to owner review in Phase 2.

Never invent achievements, projects, reviews, statistics, job titles, clients,
results, or profile addresses. The banned descriptions are listed in `AGENTS.md`.

## Publication rules

- Social profiles other than the verified GitHub and LinkedIn URLs start
  unpublished until Yoge supplies the real links.
- Project statuses are Idea, Researching, In development, Prototype, Live, or
  Paused. Describe unfinished functionality as planned work.
- Keep placeholders marked `TODO(yoge)` unpublished. Development-only demo
  records may not be seeded into production.
- Hide empty homepage sections. Dedicated collection pages may explain that
  content is coming soon without inventing example items.
- Publish testimonials only with permission and a real source URL.
- Use a real, unaltered headshot supplied by Yoge when one is available.

## Articles and resources

Articles will use MDX content collections. The eventual template must include
real publication/update dates, a description, and optional original canonical
URL. Preview every article before merging and deploying it.

Resource files will be committed under `public/resources/`. Keep each file
within the verified static asset size limit, use a stable filename, document
its license, and create its database metadata through admin after deployment.
Do not upload private or unlicensed material.

## Newsletter and contact

Until newsletter delivery is implemented and enabled, use the specified copy:
"You're on the list. I'll email you when the newsletter launches."
Do not promise a confirmation email that the system cannot send.

A public contact email must be explicitly supplied by Yoge. The private alert
email, subscriber addresses, contact messages, and consent records are not
public content and must not enter this repository.

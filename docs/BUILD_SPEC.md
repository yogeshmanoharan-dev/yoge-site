# Yogesh Manoharan — Personal Website: Complete Build Specification
**Version:** 1.0 · **Written:** 14 Nov 2026 · **Owner:** Yogesh Manoharan (Yoge)
**For:** Claude Code or OpenAI Codex (or any AI coding agent), working in phases with Yoge reviewing.
**Budget:** ₹0. Every service in this spec is free and needs no credit card.
**Goal:** a complete, production website: an immersive 3D scrolling frontend, a real backend, a real database and a private admin dashboard. Not a prototype.

---

## 0. HOW TO USE THIS FILE (for Yoge)

1. Create an empty folder, e.g. `C:\Users\<you>\Documents\Projects\yoge-site`.
2. Save this file inside it as `docs/BUILD_SPEC.md`.
3. Copy **Section 1 (Agent Rules)** into two files at the folder root:
   - `CLAUDE.md` (Claude Code reads this automatically)
   - `AGENTS.md` (Codex reads this automatically)
4. Open the folder in VS Code and start Claude Code or Codex there.
5. Paste the **Kickoff Prompt** from Section 19.
6. The agent works one phase at a time (Section 17). At every **🛑 STOP** gate, it shows you what it built. Check it in your browser, then say "approved, continue" or ask for changes.
7. Never let the agent skip a gate, and never approve production deployment without looking at the preview first.

**Free accounts you need** (see Section 20 for step-by-step):
| Service | Used for | Card needed? |
|---|---|---|
| GitHub | Code, version control, CI, admin login | No |
| Cloudflare (Free plan) | Hosting (Workers), database (D1), spam protection (Turnstile), analytics | No, for the products used here |
| Resend (Free plan, optional) | Email alerts to you when someone messages | No |
| Google Search Console | Search indexing | No |

**Deliberately NOT used** (they can ask for a payment method or cost money): Cloudflare Zero Trust/Access, Cloudflare R2, Vercel Pro, paid fonts, paid 3D assets, paid CMS, paid domain.

**Your site's address at launch:** a free `*.workers.dev` URL (e.g. `yoge-site.<your-subdomain>.workers.dev`). A custom domain (e.g. yogeshmanoharan.com) costs money each year, so it's a later, optional upgrade. The site is built so adding one later takes about 15 minutes.

---

## 1. AGENT RULES (copy this whole section into CLAUDE.md and AGENTS.md)

```md
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
```

---

## 2. IDENTITY & CONTENT FACTS (the only source of truth)

### 2.1 Verified facts
| Field | Value |
|---|---|
| Full name | Yogesh Manoharan |
| Creator name | Yoge |
| Preferred handle | @yogeshmanoharan_ai (where available; varies by platform) |
| Location | India |
| Background | Freelance designer on **Fiverr** and **Upwork** |
| Now | Creates AI and AI-related content: AI concepts explained clearly, AI tools tested on real tasks, practical tutorials. Builds with AI tools. |
| Brand statement | "Building AI-powered products & sharing AI-driven content." |
| GitHub (verified) | https://github.com/yogeshmanoharan-dev |
| LinkedIn (current default URL) | https://www.linkedin.com/in/yogesh-manoharan-5512a144b (may change to a custom URL; editable in admin) |
| Other platforms | YouTube, Instagram, X, Facebook, Threads, Medium, Reddit, Discord, Fiverr, Upwork. **URLs entered by Yoge in the admin. Do not guess.** |

### 2.2 Things the site must NOT say
- No job titles from the banned list (Section 1).
- No "beginner", "aspiring", "just starting", "Day 1".
- No client names, client counts, ratings, earnings or years of experience (unless Yoge adds them later in admin with proof).
- No employers other than the freelance work above.

### 2.3 Default copy (drafts: Yoge approves in Phase 2; all editable in admin)
- **Hero eyebrow:** `YOGESH MANOHARAN — YOGE`
- **Hero headline options** (stored in `site_settings.hero_headline`):
  - A (default): **"AI, tested and explained."**
  - B: **"Building with AI. Sharing what actually works."**
  - C: the brand statement. Enable when Yoge has a live AI product on the site.
- **Hero sub-line:** "Designer turned AI creator. I break down AI concepts, test AI tools on real tasks, and share what I build along the way."
- **About (short):**
  > I'm Yoge — Yogesh Manoharan, based in India. I started out as a freelance designer on Fiverr and Upwork. Today I create AI content: clear explainers, honest tool tests and practical tutorials. And I build with AI along the way.
  > My design background shapes how I look at AI: who it's for, where the experience breaks, and whether it actually solves a problem.
- **Primary CTA:** "Explore my work" → scrolls to Lab/Content · **Secondary CTA:** "Say hello" → /contact

---

## 3. PRODUCT OVERVIEW

### 3.1 What the site does
1. **Identity:** who Yoge is, instantly, in a memorable 3D experience.
2. **Social hub:** every social profile in one place (replaces link-in-bio tools).
3. **AI Lab:** current and future AI projects with honest status, updates, links.
4. **Content hub:** latest videos, articles, posts (internal articles + external links).
5. **Resources:** free downloadable guides, templates, prompt packs.
6. **Audience:** newsletter signups and contact messages, stored in a real database.
7. **Admin:** a private dashboard where Yoge edits everything without touching code.

### 3.2 Sitemap
| Route | Type | Purpose |
|---|---|---|
| `/` | Hybrid (static shell + live data) | Immersive scrolling 3D story, chapters 1–9 (§4.3) |
| `/about` | Static + settings | Full story, photo, approach, toolkit |
| `/lab` | Live (DB) | All AI projects, filter by status |
| `/lab/[slug]` | Live (DB) | Project detail: problem, plan, stack, status, updates log, links |
| `/content` | Hybrid | All content: articles + videos + posts, filter by platform/type |
| `/articles/[slug]` | Static (MDX) | Native long-form articles |
| `/resources` | Live (DB) | Resource library |
| `/resources/[slug]` | Live (DB) | Resource landing page + download |
| `/links` | Live (DB) | Mobile-first link page: all socials + featured items (for Instagram/TikTok bios) |
| `/now` | Live (DB) | What Yoge is focused on this month (dated entries) |
| `/uses` | Static (MDX) | Tools, apps, gear Yoge actually uses |
| `/contact` | Static + API | Contact form (Turnstile-protected) + email + socials |
| `/newsletter` | Static + API | Signup page (also embedded in home/footer) |
| `/privacy` | Static | Privacy notice |
| `/admin/**` | Live, private | Admin dashboard (§8) |
| `/api/**` | Server | Backend endpoints (§7) |
| `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, `/404`, `/500` | Generated | System routes |

**Nav (desktop):** Lab · Content · Resources · About · [Say hello]. **Mobile:** full-screen animated menu.
**Footer:** socials, newsletter mini-form, Now, Uses, Privacy, "Built by Yoge with AI tools" credit, last-updated date.

---

## 4. EXPERIENCE & CREATIVE DIRECTION

### 4.1 Concept: "Paper & Signal"
A premium editorial world where **paper** (Yoge's designer side: cream paper, cut-out portrait, torn labels, annotation lines, crop marks) meets **signal** (the AI side: glowing orange light, flowing particles, monospace data labels, a living 3D form).
The 3D centrepiece is a **folded-paper sculpture**: a faceted, origami-like form made of cream paper planes, edge-lit in orange. It **unfolds, reassembles and travels** as the visitor scrolls, changing shape for each chapter. It should feel crafted, calm and expensive, like a high-end studio site. Original work, not a copy of any existing site.

### 4.2 Design tokens (CSS custom properties; single source in `src/styles/tokens.css`)
**Colour**
| Token | Role | Starting value (tune in Phase 2, verify contrast) |
|---|---|---|
| `--paper` | Main background | warm cream, e.g. `#F4EEE3` |
| `--paper-raised` | Cards | off-white, e.g. `#FBF8F2` |
| `--ink` | Text | near-black, e.g. `#141312` |
| `--charcoal` | Dark chapters, code, footer | e.g. `#1E1D1C` |
| `--signal` | Highlight / CTA fill / 3D edge light | vibrant orange, e.g. `#FF5A1F` |
| `--signal-ink` | Orange used as TEXT (must pass 4.5:1 on paper) | darker orange, e.g. `#B83A0B` (verify) |
| `--lavender` | Secondary tags/panels | e.g. `#CFC6F2` |
| `--muted-purple` | Accents on lavender/dark | e.g. `#6E5FA8` |

Rules:
- Orange marks **one** primary thing per viewport.
- Dark "charcoal" chapters create rhythm (cream → charcoal → cream).
- All text pairs must pass WCAG AA. Write a contrast test (Phase 2).

**Typography** (all SIL Open Font License, self-hosted WOFF2 variable, subset Latin; at most 3 families)
- Display serif: **Fraunces** or **Instrument Serif** (pick in Phase 2 from specimens)
- Text/UI grotesk: **Inter** or **Geist**
- Mono labels/code: **JetBrains Mono**
- Fluid type scale with `clamp()`: display up to ~9rem on desktop, never overflows on 320 px screens.

**Spacing/layout:** 4 px base scale; 12-column grid desktop, 4-column mobile; max content width ~1280 px; reading width ~68ch.
**Radius:** small (4–8 px); paper cards get slightly irregular "torn" SVG edges as decoration only.
**Texture:** subtle paper grain (tiny tiled noise PNG/SVG, < 10 KB), crop marks, hairline grid.

### 4.3 Homepage scroll story (chapters)
One persistent WebGL canvas, fixed behind the content. HTML content scrolls normally over it. Scroll progress drives the 3D scene.

| # | Chapter | HTML content | 3D behaviour | Motion |
|---|---|---|---|---|
| 1 | **Hero** | Eyebrow, giant headline (split-text reveal), sub-line, 2 CTAs, scroll cue | Folded-paper sculpture floats centre-right, slowly breathing; tilts toward the cursor (desktop) / device-tilt optional (mobile, off by default) | Headline lines rise in; sculpture fades in after the text paints (never blocks the headline) |
| 2 | **Intro / manifesto** | 2–3 sentence manifesto, words highlight as you scroll | Sculpture rotates and opens one face, revealing an orange light core | Scroll-scrubbed word highlight |
| 3 | **What I do** | 3 pillars: **Explain** (AI concepts) · **Test** (AI tools on real tasks) · **Build** (with AI) | Sculpture splits into 3 paper panels that align behind each pillar card | Cards slide up with stagger |
| 4 | **Featured content** | Latest videos + articles from DB; desktop: pinned horizontal scroll track; mobile: vertical cards | Panels flatten into a "paper wall"; subtle parallax | Horizontal track scrubbed by vertical scroll (desktop only) |
| 5 | **AI Lab** (charcoal chapter) | Project cards with status badges, short description, stack chips, "View" | Background turns charcoal; panels become glowing "capsules" per project, orange signal particles flow between them | Cards reveal; hover lifts capsule |
| 6 | **Resources** | Featured resources with format/size chips + download buttons | Paper sheets fan out like a stack of printed guides | Fan-out scrubbed |
| 7 | **Social universe** | All social links as large tappable tiles (name, handle, platform icon, CTA) | Social tiles' 3D counterparts orbit the re-formed sculpture like satellites; hovering a tile highlights its satellite | Orbit slow-rotates; tiles are always plain HTML links (3D is decorative only) |
| 8 | **Kind words** | Real client reviews from Fiverr/Upwork that Yoge adds in admin, each with source link. **Hidden entirely if none published.** | Calm: sculpture rests | Simple fade |
| 9 | **Let's talk** | Newsletter signup + "Say hello" + email | Sculpture folds back into its hero form, orange light pulses once | Final headline reveal |

**Other pages:** lighter treatment. A small paper-fold accent animation in the page header, scroll reveals, no full 3D scene (performance). `/lab/[slug]` can show a small 3D capsule for the project (optional, Phase 8).

### 4.4 Interaction details (premium feel)
- **Smooth scrolling** with Lenis, using native scroll underneath (no scroll hijacking, scrollbars and keyboard work, anchor links work). Disabled when `prefers-reduced-motion: reduce`.
- **Split-text reveals** for big headings (GSAP SplitText, free). Text stays real, selectable HTML with accessible names.
- **Magnetic primary buttons** (subtle, desktop pointer only).
- **Hover-tilt cards** (max 6°), with focus states equal to hover.
- **Page transitions:** Astro View Transitions (fade/slide, ≤ 400 ms). Never blocks navigation.
- **Scroll progress indicator** (thin orange line, top).
- **Sound:** none.
- **No** custom cursor replacing the system cursor, **no** mandatory intro loader, **no** scroll-jacking, **no** autoplay video with sound.

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Stack (all free, open source)
Use the **latest stable** version of each at setup time. Check the official docs, then **pin exact versions** in package.json.

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js current **LTS** | Check nodejs.org |
| Framework | **Astro** (latest stable major) + TypeScript strict | Static pages + on-demand server routes + islands |
| Adapter | `@astrojs/cloudflare` | Deploys to Cloudflare Workers with static assets |
| UI islands | React (via `@astrojs/react`) **only** for the 3D scene and complex interactive widgets | Everything else is Astro components with zero JS |
| 3D | **three.js** + **@react-three/fiber** + **@react-three/drei** | Procedural geometry (no paid assets) |
| Animation | **GSAP** (incl. ScrollTrigger, SplitText; free incl. commercial use) | |
| Smooth scroll | **Lenis** | Native-scroll based |
| Styling | Plain modern CSS + tokens (CSS custom properties, nesting, container queries) | No Tailwind (keeps design-token control and fewer deps) |
| Content (articles, uses) | Astro content collections, MDX | Git-based |
| Database | **Cloudflare D1** (SQLite) | Free plan |
| ORM / migrations | **Drizzle ORM** + drizzle-kit, applied with `wrangler d1 migrations` | |
| Validation | **Zod** | Every server input |
| Forms/backend | **Astro Actions** + API routes | |
| Spam protection | **Cloudflare Turnstile** (free) | Server-side token verification |
| Admin auth | **GitHub OAuth** via **Arctic** library + custom sessions in D1 | Allowlist = Yoge's numeric GitHub user ID |
| Email alerts (optional) | **Resend** free plan | Only to Yoge's own inbox until a domain exists |
| Analytics | **Cloudflare Web Analytics** (free, cookieless) + first-party aggregate counters in D1 | No personal data |
| Testing | Vitest (unit), Playwright (e2e), @axe-core/playwright (a11y), Lighthouse CI | |
| CI/CD | GitHub Actions (free for public repos) + Wrangler | |
| Icons | Simple Icons (CC0) for platform logos; Lucide (ISC) for UI icons | |

### 5.2 Rendering strategy
- **Static (prerendered at build):** `/about`, `/uses`, `/privacy`, `/articles/[slug]`, `/content` shell, `/contact` and `/newsletter` shells. Zero server cost, fastest.
- **On-demand (server-rendered per request, reads D1):** `/`, `/lab`, `/lab/[slug]`, `/resources`, `/resources/[slug]`, `/links`, `/now`, `/admin/**`, `/api/**`.
  - Public on-demand pages send `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300` (verify Cloudflare cache behaviour for Workers; if not effective, add a small in-Worker cache via the Cache API).
  - Admin saves invalidate affected cache keys.
- Homepage: the HTML (text, links, cards) is server-rendered from D1 so it's crawlable and fast. The 3D island hydrates on `client:idle` / when visible, after the LCP.

### 5.3 Architecture diagram
```
Browser ──HTTPS──► Cloudflare Worker (Astro app)
                     ├─ static assets (free, unlimited): HTML, CSS, JS, fonts, images, resource files
                     ├─ on-demand pages ──► D1 (SQLite)
                     ├─ /api/* + Astro Actions ──► Zod validate ──► Turnstile verify ──► D1
                     │                                                  └─► Resend (alert email, optional)
                     └─ /admin/* ──► session check (D1) ──► GitHub OAuth (login only)
GitHub repo ──push──► GitHub Actions: lint, typecheck, test, build ──► wrangler deploy (on approval)
```

### 5.4 Folder structure
```
/
├─ CLAUDE.md, AGENTS.md, README.md, LICENSE (MIT for code; content © Yoge)
├─ docs/ BUILD_SPEC.md, DECISIONS.md (ADR log), RUNBOOK.md, CONTENT_GUIDE.md
├─ astro.config.mjs, wrangler.jsonc, drizzle.config.ts, tsconfig.json, package.json
├─ .dev.vars.example (no real values), .gitignore (.dev.vars, .wrangler, node_modules, dist)
├─ migrations/              # SQL migrations (generated by drizzle-kit, applied by wrangler)
├─ public/
│  ├─ fonts/ images/ og/ resources/   # resource files (PDF etc.) ≤ 25 MiB each
│  └─ favicon.svg, robots.txt (or generated)
├─ src/
│  ├─ styles/ tokens.css, base.css, typography.css, utilities.css
│  ├─ components/ ui/ (Button, Card, Badge, Chip, Tag, Input...), sections/ (Hero, Manifesto, Pillars,
│  │   FeaturedContent, Lab, Resources, SocialUniverse, KindWords, LetsTalk), layout/ (Header, Nav, Footer)
│  ├─ islands/ experience/ (Experience.tsx, Sculpture.tsx, Satellites.tsx, Particles.tsx, store.ts,
│  │   chapters.ts, quality.ts, Fallback.astro)
│  ├─ layouts/ BaseLayout.astro, PageLayout.astro, ArticleLayout.astro, AdminLayout.astro
│  ├─ pages/ (routes per §3.2), pages/api/, pages/admin/
│  ├─ actions/ index.ts (contact, subscribe, unsubscribe, admin CRUD)
│  ├─ content/ articles/*.mdx, uses.mdx  (+ content.config.ts)
│  ├─ db/ schema.ts, client.ts, queries/*.ts, seed.ts
│  ├─ lib/ auth.ts, session.ts, turnstile.ts, ratelimit.ts, email.ts, seo.ts, cache.ts, env.ts, hash.ts
│  └─ middleware.ts         # security headers, admin guard, request id
├─ tests/ unit/, e2e/, a11y/
└─ .github/workflows/ ci.yml, deploy.yml
```

---

## 6. DATABASE (Cloudflare D1, managed with Drizzle)

Conventions: `id` = text UUID (crypto.randomUUID) or integer autoincrement for logs. Timestamps are ISO-8601 UTC text. Booleans are integers (0/1). Every content table has `is_published` and `sort_order`. Index columns used in WHERE/ORDER BY (D1 bills rows *read*, so avoid full scans).

| Table | Key columns | Notes |
|---|---|---|
| `site_settings` | key (PK), value (JSON text), updated_at | hero_headline, hero_subline, about_short, availability_note, seo_defaults, feature flags (`newsletter_emails_enabled`, `kind_words_enabled`) |
| `social_links` | id, platform (enum), label, handle, url, is_primary, is_published, sort_order, show_on_links_page, created_at, updated_at | Platforms: youtube, instagram, linkedin, x, github, facebook, threads, medium, reddit, discord, fiverr, upwork, email, website, other. URL must be https and match the platform's domain (validation map) |
| `projects` | id, slug (unique), title, tagline, summary, problem, approach, status (enum: idea, researching, in_development, prototype, live, paused), stack (JSON array), ai_assistance_note, repo_url, demo_url, cover_image, is_featured, is_published, sort_order, started_at, updated_at | `ai_assistance_note` e.g. "Built with Claude Code": shown on detail page |
| `project_updates` | id, project_id (FK), title, body_md, created_at, is_published | Build-log entries per project |
| `content_items` | id, type (video, short, article_external, post, podcast), platform, title, description, url, thumbnail_url, published_at, is_featured, is_published, sort_order | External content cards (YouTube, Medium, LinkedIn, X…). Native articles come from MDX and are merged in `/content` |
| `resources` | id, slug, title, description, audience, what_inside (JSON), format, file_path (under /resources/), file_size_bytes, version, preview_image, related_url, is_published, sort_order, created_at, updated_at | Files live in `public/resources/` (committed) |
| `now_entries` | id, month (YYYY-MM), body_md, is_published, created_at | Latest published shown on /now |
| `testimonials` | id, quote, author_name, author_context, source_platform (fiverr/upwork/other), source_url, permission_confirmed (0/1), is_published, sort_order | Publish ONLY if `permission_confirmed = 1` and `source_url` set (enforced in validation) |
| `messages` | id, name, email, subject, body, status (new, read, archived), created_at | From contact form. Retention: auto-delete after 12 months |
| `subscribers` | id, email (unique, lowercased), status (pending, subscribed, unsubscribed), consent_text, source (page), unsubscribe_token_hash, created_at, confirmed_at | Double opt-in emails only when `newsletter_emails_enabled` and a verified sending domain exist |
| `events_daily` | day (YYYY-MM-DD), event (resource_download, outbound_social, outbound_content), ref (slug/platform), count | PK(day, event, ref). Aggregate counters only, no personal data |
| `admin_sessions` | id_hash (PK, SHA-256 of token), github_user_id, created_at, expires_at, last_seen_at, user_agent_hash | Session tokens never stored in plain text |
| `rate_limits` | key (PK: action + hashed IP + window), count, window_start | Raw IPs are never stored; HMAC(IP, daily-rotating secret) |
| `audit_log` | id (int), at, actor, action, entity, entity_id, diff_json | Every admin create/update/delete |

**Seed data (`src/db/seed.ts`, local only by default):**
- Settings: copy from §2.3.
- `social_links`: GitHub (published, verified URL), LinkedIn (published, current URL). Every other platform is created **unpublished** with an empty URL and `TODO(yoge)`.
- No projects, testimonials, resources or content items with fake data. For local development only, a separate `seed.dev.ts` may insert clearly fake demo rows titled "DEMO —" that are **never** run against production (guard by environment).

---

## 7. BACKEND (APIs, Actions, security)

### 7.1 Public endpoints
| Endpoint | Method | Does | Protection |
|---|---|---|---|
| Action `contact.send` | POST | Validate (name 1–80, email, subject ≤120, body 10–5000), verify Turnstile, store in `messages`, send alert email to Yoge (if Resend configured), return success | Turnstile + rate limit 5/hour/IP-hash + honeypot field + origin check |
| Action `newsletter.subscribe` | POST | Validate email, Turnstile, upsert `subscribers` (status `pending` if emails disabled, else send confirm email), generic success message (don't reveal whether the email already exists) | Turnstile + rate limit 5/hour |
| `/api/newsletter/confirm?token=` | GET | Confirm subscription (token hash lookup) | Single-use token, 7-day expiry |
| `/api/newsletter/unsubscribe?token=` | GET/POST | One-click unsubscribe | Token |
| `/r/[kind]/[ref]` | GET | Increment `events_daily` then 302 redirect to the stored URL (resource file, social link, content item) | Only redirects to URLs stored in DB (no open redirect) |
| `/api/health` | GET | Returns `{ok, version, db: "ok"}` | No secrets |

**Newsletter copy while emails are disabled:** "You're on the list. I'll email you when the newsletter launches." Never promise a confirmation email that won't arrive.

### 7.2 Admin endpoints
- All under `/admin/**` and admin Actions. **Middleware rejects any request without a valid session** (redirect to `/admin/login` for pages, 401 for actions).
- CRUD for every table in §6 except sessions/rate limits.
- Every mutation: Zod validate → write → `audit_log` entry → cache invalidation.

### 7.3 Security requirements
- Keep Astro's `security.checkOrigin` enabled (CSRF protection for forms/actions).
- Security headers in middleware/`_headers`:
  - Content-Security-Policy (use Astro's built-in CSP support if available in the installed version; allow only self, Turnstile, Cloudflare Web Analytics, YouTube thumbnails if used)
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (camera, mic, geolocation off)
  - `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
- Cookies: `HttpOnly; Secure; SameSite=Lax; Path=/`, session cookie name `__Host-yoge_session`.
- Markdown from the DB (now entries, project updates) is rendered with sanitisation (no raw HTML).
- All secrets via Wrangler secrets / `.dev.vars`. A validated `env.ts` fails fast if any are missing.
- GitHub repo settings: secret scanning + push protection + Dependabot alerts **on**.
- Error pages never leak stack traces in production. Log the error with a request ID.

### 7.4 Secrets & variables
| Name | Where | Purpose |
|---|---|---|
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | secret | Admin OAuth |
| `ADMIN_GITHUB_USER_IDS` | var | Comma list of allowed numeric GitHub user IDs (just Yoge's) |
| `SESSION_SECRET` | secret | HMAC for tokens |
| `IP_HASH_SECRET` | secret | HMAC for rate-limit keys |
| `TURNSTILE_SITE_KEY` | var (public) | Widget |
| `TURNSTILE_SECRET_KEY` | secret | Server verification |
| `RESEND_API_KEY` | secret (optional) | Alert emails |
| `ALERT_EMAIL_TO` | secret | Yoge's inbox (never committed, never shown on site) |
| `PUBLIC_SITE_URL` | var | Canonical base URL (workers.dev now, custom domain later) |
| `CF_API_TOKEN`, `CF_ACCOUNT_ID` | GitHub Actions secrets | Deploys (token scoped to Workers + D1 edit only) |

---

## 8. ADMIN DASHBOARD (`/admin`)

**Auth flow:** `/admin/login` → "Sign in with GitHub" → GitHub OAuth (Arctic) → callback verifies `state` → fetch GitHub user → **reject unless numeric user ID is in `ADMIN_GITHUB_USER_IDS`** → create session (random 32-byte token, store SHA-256 hash, 7-day expiry, sliding renewal) → set cookie. Logout deletes the session row. Show "last login" time on the dashboard.

**Screens** (clean, fast, keyboard-friendly; same tokens as the site, no 3D):
1. **Dashboard:**
   - new messages count
   - subscriber count
   - top resources (30 days)
   - outbound social clicks (30 days)
   - D1 usage reminder (link to Cloudflare dashboard)
   - quick links
2. **Messages:**
   - inbox list
   - read view
   - mark read/archive
   - delete
   - "reply via email" mailto link
3. **Subscribers:**
   - list
   - status filter
   - CSV export
   - delete (privacy requests)
4. **Social links:**
   - add/edit
   - drag-to-reorder (keyboard alternative: up/down buttons)
   - publish toggle
   - URL validation per platform
   - "test link" button
5. **Projects:**
   - CRUD
   - status
   - stack chips
   - AI-assistance note
   - links
   - cover image path
   - publish/feature toggles
   - updates log (add entries)
6. **Content items:**
   - CRUD
   - feature toggle
   - optional "fetch title from URL" helper for YouTube (oEmbed, no API key)
7. **Resources:**
   - CRUD (file must exist in `/public/resources/`; show file size automatically at build/deploy)
8. **Now:** monthly entries
9. **Kind words:**
   - CRUD
   - publish blocked unless permission confirmed + source URL
10. **Settings:**
    - hero headline (A/B/C)
    - sub-line
    - about short
    - availability note
    - feature flags
    - SEO defaults
11. **Audit log:** read-only

Every form:
- server validation with inline accessible errors
- success toasts
- unsaved-changes warning
- markdown preview where relevant

---

## 9. 3D & MOTION ENGINEERING

### 9.1 Scene
- **Sculpture:** procedural, about 12–20 flat paper "facets" (custom BufferGeometry or extruded thin boxes).
  - Material: cream paper, MeshStandardMaterial / MeshPhysicalMaterial with subtle roughness, plus a tiny procedural grain normal.
  - Edges: orange emissive lines (`EdgesGeometry` or a shader rim light).
  - Each facet has target transforms per chapter (keyframes in `chapters.ts`).
- **Particles:** instanced points (≤ 2,000 desktop, ≤ 600 mobile) for the "signal" flow in the Lab chapter.
- **Satellites:** one small paper tile per *published* social link (count from DB), orbiting in the Social chapter.
- **Lighting:** one soft key light + ambient + orange rim. Optional `Environment` from drei with a tiny built-in preset (no large HDR downloads).
- **Postprocessing:** none by default. At most a subtle vignette/noise if it stays inside budgets.

### 9.2 Scroll → 3D wiring
- GSAP ScrollTrigger watches each chapter `<section data-chapter="n">`. It writes `chapterIndex` + `chapterProgress (0–1)` into a tiny store (`store.ts`, e.g. a plain observable or zustand).
- R3F `useFrame` reads the store and interpolates facet transforms between keyframes with damping (`maath/easing` or a custom lerp). The 3D never drives layout; HTML is always the source of truth.
- Lenis drives smooth scroll and calls `ScrollTrigger.update` on scroll.

### 9.3 Performance & quality tiers (`quality.ts`)
- **Tier detection:** WebGL2 support, `navigator.hardwareConcurrency`, `navigator.deviceMemory` (where available), screen size, reduced-motion, Save-Data header/`navigator.connection.saveData`.
  - **High:** full scene, DPR clamp [1, 1.75].
  - **Medium (most phones):** fewer facets/particles, DPR clamp [1, 1.25], no shadows.
  - **Static:** no WebGL; show a pre-rendered poster image of the sculpture (exported from the scene in Phase 6, AVIF/WebP) with CSS parallax.
- Canvas mounts only after the hero text has painted (`requestIdleCallback`/`client:idle`). 3D code is a separate lazy chunk.
- Pause rendering when the tab is hidden or the canvas is off-screen. Use `frameloop="demand"` when idle.
- Dispose geometries/materials on unmount. No memory growth on navigation (test this).
- Respect `prefers-reduced-motion`: sculpture static (or very slow), no scrubbed transforms, no Lenis, no split-text animation (text simply visible).
- Add a small visible **"Motion: on/off"** toggle in the footer (stored in localStorage, wrapped in try/catch).
- A visitor without WebGL/JS gets the full content and every link. The 3D is decoration and never holds information.

### 9.4 Motion language
- Easing: `power3.out` / `expo.out` for reveals.
- Durations: 0.5–0.9 s. Stagger: 0.04–0.08 s.
- Nothing flashes more than 3 times per second. No large-area flashing.
- Animate only `transform`/`opacity` in the DOM (no layout-thrashing properties).

---

## 10. SEO, METADATA & SHARING
- Unique `<title>` and meta description for every page (admin-editable for DB pages, frontmatter for MDX).
- Canonical URLs from `PUBLIC_SITE_URL`. Switching to a custom domain later = change one variable + add redirects.
- Open Graph + Twitter card tags. **Build-time OG image generation** (satori + resvg) in the brand style for articles, projects and resources; a default OG image for others.
- JSON-LD:
  - `Person` (name, url, sameAs = published social URLs only)
  - `WebSite`
  - `Article` on articles
  - `BreadcrumbList`
  - **No** fake ratings/reviews schema.
- `@astrojs/sitemap` (exclude /admin, /api, /r). `robots.txt` disallows /admin and /api.
- RSS feed for articles.
- Semantic headings (one H1 per page), descriptive link text, image alt text.
- Articles: `published` and real `updated` dates. Canonical can point to the original if an article was first published elsewhere (frontmatter `canonical`).
- Google Search Console verification via meta tag or DNS (after the first deploy). Submit the sitemap.

---

## 11. ACCESSIBILITY (WCAG 2.2 AA)
- Semantic landmarks, skip link, logical focus order, visible focus ring (2 px, contrasting).
- All interactive elements keyboard-operable, with targets ≥ 24×24 px (44 px preferred on mobile).
- Mobile menu: focus trap, Esc to close, `aria-expanded`.
- Forms: labels, `aria-describedby` errors, error summary, no placeholder-only labels. Turnstile is WCAG-compliant.
- Colour contrast tests automated (Phase 2). Never use colour as the only signal (status badges have text).
- Canvas: `aria-hidden="true"`. All meaning is in HTML.
- Reduced-motion fully honoured (§9.3), plus the manual motion toggle.
- Tests: axe on every page in Playwright + a manual keyboard pass + a screen-reader smoke test (NVDA on Windows) before launch.

---

## 12. PERFORMANCE BUDGETS
| Metric | Budget |
|---|---|
| LCP (mobile, 4G) | ≤ 2.5 s. The LCP element is the hero **text**, never the canvas |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 (reserve space for images, fonts with `size-adjust` fallbacks) |
| JS before LCP (homepage) | ≤ 60 KB gzipped (Lenis + GSAP core only if needed above the fold) |
| 3D chunk (lazy, after LCP) | ≤ 300 KB gzipped (three + r3f + scene). Measure with the bundle analyzer |
| Content pages JS | ≤ 30 KB gzipped |
| Fonts | ≤ 150 KB total, `font-display: swap`, preload only the display weight used in the hero |
| Images | AVIF/WebP via Astro `<Image>`, explicit width/height, lazy below the fold |
| Lighthouse (mobile) | ≥ 90 Performance on content pages; ≥ 80 on homepage with 3D; 100 Accessibility target; ≥ 95 Best Practices/SEO |

Lighthouse CI runs in GitHub Actions and fails the build if budgets regress by more than 5 points.

---

## 13. PRIVACY
- `/privacy` page in plain English:
  - what is collected (contact messages, newsletter emails, aggregate counters, Cloudflare Web Analytics)
  - why
  - how long (messages 12 months, subscribers until unsubscribe)
  - how to request deletion (email)
  - third parties (Cloudflare, Resend, GitHub for admin only)
- Written with India's Digital Personal Data Protection Act, 2023 in mind. **Mark it "to be reviewed" in `docs/DECISIONS.md`**: the agent must not claim legal compliance.
- No cookies for visitors (admin session cookie only), so no cookie banner is needed. Verify this remains true if anything is added.
- Consent text stored with each subscriber. Unsubscribe link in every email.
- A scheduled cleanup (Cron Trigger, free plan allows a few) deletes messages older than 12 months and expired sessions/rate-limit rows daily.

---

## 14. TESTING & CI
- **Unit (Vitest):** validators, URL-per-platform rules, rate limiter, session hashing, testimonial publish rule, slug generation, chapter keyframe interpolation.
- **Integration:** Actions against a local D1 (`wrangler dev` / Miniflare). Contact → stored; subscribe twice → single row; unauthorised admin action → 401.
- **E2E (Playwright, Chromium + Firefox + WebKit):**
  - home renders all chapters with WebGL on and **off** (`--disable-webgl` / forced static tier)
  - nav, mobile menu
  - contact form (Turnstile **test keys**)
  - newsletter, /links, /r/ redirects
  - admin login guard (mock OAuth in test env)
  - admin CRUD round-trip
- **A11y:** axe on all public pages, including both cream and charcoal chapters.
- **Visual:** Playwright screenshots at 375, 768, 1280, 1920 widths for key pages (stored as CI artifacts for Yoge to review).
- **CI workflow (`ci.yml`, on every push/PR):**
  1. install
  2. typecheck
  3. lint (ESLint + Prettier)
  4. unit
  5. build
  6. e2e
  7. Lighthouse CI
  8. `npm audit --omit=dev` (report only)

---

## 15. DEPLOYMENT (Cloudflare Workers, free)
- `wrangler.jsonc`: worker name, compatibility date (current), assets directory, D1 binding `DB`, vars, cron trigger for cleanup, observability logs on.
- **Environments:**
  - `local`: wrangler dev + local D1.
  - `preview`: Wrangler versions upload → preview URL, using its **own** D1 database `yoge-site-preview`, never the production DB (the free plan allows 10 DBs).
  - `production`.
- **deploy.yml:**
  - PR → build + upload a preview version (comment preview URL on the PR).
  - Merge to `main` → **manual approval required** (GitHub Environments "production" with Yoge as required reviewer; free for public repos) → apply D1 migrations → `wrangler deploy`.
- **Post-deploy smoke test** (scripted):
  - `/api/health`
  - home 200
  - one article 200
  - `/admin` redirects to login
  - security headers present
- **Rollback:** `wrangler rollback` to the previous version (document in RUNBOOK). Migrations must be backward-compatible (additive first, destructive later).
- **Custom domain later** (Phase 10 note):
  1. buy a domain (Yoge's approval)
  2. add to Cloudflare
  3. attach as a Worker custom domain
  4. update `PUBLIC_SITE_URL`
  5. 301 from workers.dev
  6. update Search Console, Turnstile hostnames, OAuth callback URL

---

## 16. OPERATIONS (after launch)
- **Publishing an article:**
  1. create `src/content/articles/slug.mdx` (template in `docs/CONTENT_GUIDE.md`)
  2. open a PR
  3. check the preview
  4. merge
  5. approve the deploy
- **Everything else** (socials, projects, content cards, resources metadata, now, settings): edit in `/admin`, live within ~1 minute.
- **Adding a resource file:** commit to `public/resources/`, deploy, then create the resource in admin.
- **Backups:**
  - D1 Time Travel (7 days on free plan) for quick restore
  - plus monthly `npm run db:backup` (runs `wrangler d1 export`) to Yoge's PC (never committed: contains emails)
  - Document both in RUNBOOK.
- **Monitoring:**
  - Cloudflare dashboard (requests vs. 100k/day free, D1 rows read/written)
  - Workers logs
  - a monthly maintenance checklist in RUNBOOK: deps, broken links (link-checker script), content freshness, backups, free-tier usage
- **Dependency updates:**
  - Dependabot PRs grouped monthly
  - never auto-merge majors
  - CI must pass + preview checked

---

## 17. PHASED BUILD PLAN (the agent follows this order)

Each phase ends with a 🛑 **STOP**: the agent reports what it built, which commands/tests it ran (with results), what it couldn't verify, and what Yoge should check. Then it waits.

### Phase 0: Environment & repo
- Check Node LTS, npm, Git, Wrangler (via npx). Print versions.
- `git init`, create the folder structure, `.gitignore`, README, LICENSE, CLAUDE.md/AGENTS.md, docs skeleton.
- Guide Yoge through creating the **public** GitHub repo `yoge-site` (name can change) under `yogeshmanoharan-dev`, enabling secret scanning + push protection + Dependabot, and pushing.
- 🛑 Yoge confirms the repo URL.

### Phase 1: Skeleton & deploy pipeline
- Scaffold Astro + TS strict + Cloudflare adapter + React integration. Hello page with tokens applied.
- `wrangler login` (Yoge does the browser step). Create D1 DBs `yoge-site` and `yoge-site-preview`. Bind them.
- CI workflow (typecheck/lint/build). Deploy the hello page to workers.dev.
- **Acceptance:** the live workers.dev URL loads over HTTPS; CI is green.
- 🛑 Yoge opens the live URL.

### Phase 2: Design system
- Tokens, fonts (2–3 specimen pages comparing the font candidates), type scale, grid, paper textures, UI components (Button, Card, Badge/Status, Chip, Input, Textarea, Toast, Modal, Tabs, Social tile).
- A `/styleguide` page (dev-only; excluded from production build or protected).
- Automated contrast test for token pairs.
- **Acceptance:** all components render at 375/768/1280/1920; contrast tests pass.
- 🛑 Yoge picks fonts and approves the look and the copy drafts in §2.3.

### Phase 3: Database & backend core
- Drizzle schema (§6), migrations, seed (verified data only), query layer with indexes.
- `env.ts` validation, middleware (security headers, request ID), rate limiter, IP hashing, Turnstile verify, email module (no-op if no key), `/api/health`, `/r/` redirects, cleanup cron.
- Contact + newsletter Actions with full validation.
- Unit + integration tests.
- **Acceptance:** tests pass locally; a contact submission on preview appears in the D1 preview DB.
- 🛑 Yoge reviews.

### Phase 4: Admin dashboard
- GitHub OAuth (Yoge creates the OAuth app: Section 20), sessions, guard, all screens in §8, audit log, cache invalidation.
- **Acceptance:**
  - only Yoge's GitHub account can log in (a test proves another ID is rejected)
  - CRUD round-trips work
  - unauthenticated access is blocked on every admin route (automated test enumerates routes)
- 🛑 Yoge logs in on preview and adds his real social links.

### Phase 5: Pages & content (no 3D yet)
- All public routes from §3.2 with real data from D1/MDX, static fallback visuals, full responsive layouts, nav/mobile menu/footer, View Transitions, SEO (§10), RSS, sitemap, privacy page, 404/500.
- Empty states: sections with no published data are hidden (homepage) or show an elegant "Coming soon" (dedicated pages, e.g. "The Lab is being set up. Follow along →"). Never fake items.
- **Acceptance:** site fully usable with JS disabled; axe clean; Lighthouse mobile ≥ 90 on content pages.
- 🛑 Yoge reviews every page on his phone and laptop.

### Phase 6: 3D experience
- Experience island (§9): sculpture, chapter keyframes, ScrollTrigger store, Lenis, quality tiers, static poster export, reduced-motion behaviour, motion toggle, disposal.
- Build chapter by chapter, Hero first. After the Hero, 🛑 a mini-check with Yoge on the look before continuing.
- **Acceptance:**
  - budgets in §12 met (show the bundle analyzer + Lighthouse numbers)
  - 60 fps target on desktop, smooth on a mid-range Android (Yoge tests on his phone)
  - no console errors
  - no memory growth after 10 navigations
  - WebGL-off path identical in content
- 🛑 Yoge reviews the full scroll experience.

### Phase 7: Motion polish & micro-interactions
- Split-text reveals, magnetic buttons, hover tilt, horizontal featured track, scroll progress, page-transition polish.
- Cross-browser fixes (Chrome, Edge, Firefox; Safari via Playwright WebKit).
- 🛑 Yoge reviews.

### Phase 8: Hardening
- Full test suite, Playwright e2e across 3 engines, visual snapshots, Lighthouse CI budgets, security header check, CSP tightened, dependency audit, error pages, logging, RUNBOOK + CONTENT_GUIDE complete, DECISIONS.md up to date.
- **Acceptance:** CI fully green; a written security checklist report.
- 🛑 Yoge reviews.

### Phase 9: Launch
- Run the launch checklist (§18) on preview. Fix everything.
- After Yoge's explicit "yes, deploy": production deploy, migrations, smoke test, Search Console setup, sitemap submitted, Cloudflare Web Analytics on.
- Report the **live URL** (verified by actually loading it).
- 🛑 Done. Hand over the maintenance checklist.

### Phase 10 (later, optional): Custom domain, newsletter emails, extra pages
- Domain (requires Yoge's purchase approval), Resend domain verification, double opt-in emails, unsubscribe flow live, more 3D for project pages.

---

## 18. LAUNCH CHECKLIST
- [ ] Every page reviewed by Yoge on phone + laptop
- [ ] Every claim matches §2. No banned titles, no fake content, no `TODO(yoge)` or "DEMO —" visible (automated grep test on the build output)
- [ ] Every published social link opens the correct profile (automated link check + manual click-through)
- [ ] Contact form: real message received in admin + alert email (if configured)
- [ ] Newsletter signup stores the row; copy doesn't over-promise
- [ ] Admin: only Yoge can log in; logout works; session expiry works
- [ ] WebGL-off, JS-off, reduced-motion all tested
- [ ] Lighthouse + Core Web Vitals budgets met; axe clean; keyboard pass; NVDA smoke test
- [ ] Security headers present; no secrets in repo history (`gitleaks` or GitHub secret scanning clean)
- [ ] OG previews checked (LinkedIn Post Inspector, X/Facebook debuggers)
- [ ] Sitemap, robots, RSS, canonical correct
- [ ] Backup + rollback procedure tested once
- [ ] RUNBOOK, CONTENT_GUIDE, README complete

---

## 19. PROMPTS

### 19.1 Kickoff prompt (paste into Claude Code or Codex)
```
Read CLAUDE.md (or AGENTS.md) and docs/BUILD_SPEC.md completely before doing anything.

You are building my personal website exactly as specified. Budget is zero: only free services
that need no credit card. Follow the phased plan in §17, one phase at a time.

Start with Phase 0. First, summarise in 10 bullet points what you understood about the site,
the rules and the phases, and list anything in the spec that is unclear or that you believe is
outdated (library versions, free-tier limits). Check current official docs for anything that may
have changed. Then propose your Phase 0 plan and wait for my approval.

At every 🛑 STOP: report what you built, the exact commands and tests you ran with their output,
anything you could not verify, and what I should check. Then wait for me.
```

### 19.2 Continue prompt (each phase)
```
Phase [N] approved. Continue with Phase [N+1] from docs/BUILD_SPEC.md §17.
Plan first (files to create/change and why), then implement, test, self-review, and STOP.
```

### 19.3 Change request prompt
```
Change request: [describe exactly what you want changed, on which page/section, and why].
Inspect the relevant code first, change only what's needed, keep approved design intact,
run the affected tests, show me before/after screenshots at 375px and 1280px, then stop.
```

### 19.4 Bug prompt
```
Bug: [what happened] on [page/URL], [device/browser]. Expected: [what should happen].
Reproduce it first, find the root cause, fix it with the smallest safe change, add a test
that would have caught it, and report the cause and fix. Don't claim it's fixed until verified.
```

---

## 20. WHAT YOGE DOES HIMSELF (step by step, all free)
1. **Install on Windows:**
   - Node.js LTS from nodejs.org
   - Git from git-scm.com
   - VS Code
   - Check in PowerShell: `node -v`, `npm -v`, `git --version`
2. **Cloudflare account:**
   - Sign up at dash.cloudflare.com (Free plan).
   - Don't add a payment method.
   - Don't enable R2, Zero Trust, or any paid add-on.
3. **Wrangler login:** when the agent runs `npx wrangler login`, approve in the browser.
4. **GitHub OAuth app** (for admin login): GitHub → Settings → Developer settings → OAuth Apps → New.
   - Homepage URL: your workers.dev URL.
   - Callback URL: `<workers.dev URL>/admin/callback`.
   - Create a second OAuth app for local development (`http://localhost:4321/admin/callback`).
   - Give the agent the Client ID. Put the Client Secret into secrets yourself, following the agent's instructions (never paste secrets into chat).
5. **Your GitHub numeric user ID:** open `https://api.github.com/users/yogeshmanoharan-dev` and copy the `id` number.
6. **Turnstile:** Cloudflare dashboard → Turnstile → Add widget.
   - Hostnames: your workers.dev hostname + `localhost`.
   - Mode: Managed.
   - Put the keys into secrets.
7. **Resend (optional):** sign up free, create an API key, put it into secrets. Until you own a domain, alert emails go only to your own inbox (verify this in Resend's docs at setup).
8. **Content you provide:**
   - 1 real headshot (high resolution, your normal photo, not AI-altered)
   - your social profile URLs (enter them in admin)
   - approval of the copy in §2.3
   - real Fiverr/Upwork reviews (only if you want them shown, with the client's permission)
   - your first project ideas for the Lab, written honestly with status "Idea" or "Researching"
9. **Review every 🛑 STOP gate** in the browser, on your phone and laptop.

---

## 21. FREE-TIER LIMITS (checked 14 Nov 2026; re-verify at setup)
| Service | Free limit | What it means for this site |
|---|---|---|
| Cloudflare Workers | 100,000 requests/day for server code; **static asset requests free and unlimited**; 20,000 static files per version; 25 MiB per file | Static pages cost nothing. DB-backed pages count toward 100k/day: plenty for a personal site |
| Cloudflare D1 | 5 million rows read/day; 100,000 rows written/day; 500 MB per DB; 5 GB per account; 10 DBs; 7-day Time Travel | Use indexes; cache public pages |
| Cloudflare Turnstile | Free, up to 20 widgets, unlimited challenges, 10 hostnames per widget | One widget covers contact + newsletter |
| GSAP | 100% free incl. all plugins and commercial use (Webflow) | ScrollTrigger + SplitText OK |
| Resend (optional) | 3,000 emails/month, 100/day | Alerts only |
| GitHub | Free public repos, Actions free for public repos | CI/CD + admin OAuth |

**If a limit is hit:** the free plans fail closed (requests error until reset at 00:00 UTC). They don't silently start charging. The site design (static first, caching, indexes) keeps usage far below these limits.

### Sources
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Workers static assets billing: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- Cloudflare D1 pricing / limits: https://developers.cloudflare.com/d1/platform/pricing/ · https://developers.cloudflare.com/d1/platform/limits/
- Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- GSAP free licence: https://github.com/greensock/GSAP
- Zero Trust free plan requires payment details at checkout (why it's avoided): https://community.cloudflare.com/t/zero-trust-free-hard-0-cap-or-blocked-at-50-seats/976840
- Resend free tier (secondary): https://automationatlas.io/answers/resend-free-tier-explained-2026/
- Workers vs Pages for new projects: https://flaviocopes.com/cloudflare-pages-vs-workers/
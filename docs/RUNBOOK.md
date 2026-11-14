# Setup and operations

Status: Phase 1 application, local database, CI, and preview deployment verified.
Schema migrations, backups, production deployment, and rollback rehearsals remain
scheduled for their implementation phases.

## Local environment

The workspace is `E:\Codex\Personal Brand Website` on Windows. Open PowerShell
in this directory. The [Phase 0 report](reports/PHASE_0.md) records detected
versions and unresolved setup steps.

```powershell
node --version
npm --version
git --version
```

Node **26.13.1 LTS** is pinned in `.node-version`. Its official Windows archive
was downloaded, verified against Node's SHA-256 manifest, and extracted into the
ignored `.tools/node-v26.13.1-win-x64` directory. The global installation was
left at 24.16.0. In a new PowerShell session, activate the project copy with:

```powershell
$projectNodeDir = Join-Path (Get-Location) '.tools\node-v26.13.1-win-x64'
$env:Path = $projectNodeDir + [System.IO.Path]::PathSeparator + $env:Path
node --version
npm --version
```

Expected output is `v26.13.1` and `11.20.0`. This changes only the current
PowerShell session. On a fresh clone, install the version in `.node-version`
from [Node's official downloads](https://nodejs.org/en/download) or through a
trusted Node version manager. `.tools/` is intentionally not committed.

The project `.npmrc` pins newly added dependencies exactly and keeps npm's cache
in the ignored `.cache/npm` directory. `package-lock.json` is committed.
Use project-local Wrangler and exact versions, not a global installation.

## Create the GitHub repository

The repository was created at
[yogeshmanoharan-dev/yoge-site](https://github.com/yogeshmanoharan-dev/yoge-site).
The following procedure is retained for reference; do not create a duplicate.

1. Sign in as `yogeshmanoharan-dev` and open [New repository](https://github.com/new).
2. Create `yoge-site` as **Public**, as requested in the specification.
3. Leave README, license, and `.gitignore` initialization off because they already
   exist locally.
4. In repository Settings → Security and quality → Advanced Security, verify
   dependency graph, Dependabot alerts/security updates, secret scanning, and
   push protection. Use only the free features available to a public repository.
5. Once the actual repository is created, connect and push the local commit:

```powershell
git remote add origin https://github.com/yogeshmanoharan-dev/yoge-site.git
git push -u origin main
```

Only run `remote add` if no `origin` exists. If authentication is requested,
complete Git Credential Manager's browser flow yourself. Do not paste a personal
access token into chat, a command, a file, or a remote URL.

Confirm the real repository URL at the Phase 0 review gate. A proposed URL is
not evidence that a repository exists or that a push succeeded.

During Phase 0, the browser showed dependency graph, Dependabot alerts, and
Dependabot security updates enabled. Secret Protection and push protection
were already enabled. Monthly version-update configuration will be added when
the dependency manifest exists in Phase 1. Credit-consuming AI scans are not
part of this setup.

## Secrets and environments

- `.dev.vars.example` contains names and blank values only.
- Local secrets belong in ignored `.dev.vars`; production secrets belong in
  Cloudflare's secret store. CI deployment credentials belong in GitHub Actions
  secrets. Never put secrets in public client environment variables.
- Local D1, preview D1, and production D1 must be separate.
- Database exports belong in `backups/` or `exports/`, both ignored by Git.
- The private alert inbox must not be used as the public contact email.

## Develop and check

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/`. Stop the server with Ctrl+C. In another terminal:

```powershell
npm run typecheck
npm run lint
npm run test:deploy
npm run build
npm run smoke -- http://127.0.0.1:4321
```

`npm run check` combines the first four commands. `npm run format` formats source
and documentation but deliberately excludes the original specification and rules.
Node's built-in test runner checks deployment isolation without adding a test
framework; application tests are introduced with the backend phases.

The Cloudflare adapter uses the local Workers runtime. A sandbox that blocks
child processes or loopback networking can prevent type generation, builds, or
smoke checks. Run these in a normal local PowerShell session; do not disable TLS.

## Cloudflare login and D1

```powershell
npm run cf:login
npm run cf:whoami
```

The login uses device authorization: approve the displayed code in Cloudflare
within five minutes. This avoids the localhost callback that failed during
setup. Wrangler stores credentials in its normal user configuration, never in Git.
Only account/user read, Workers write, and D1 write permissions were requested.

The account has **Workers Free active and no payment method on file**, verified
in the Cloudflare billing dashboard on 2026-11-14. The following databases already
exist; do not run `d1 create` again:

| Environment | Database            | ID                                                           |
| ----------- | ------------------- | ------------------------------------------------------------ |
| Local       | `yoge-site-local`   | `00000000-0000-0000-0000-000000000000` (local-only sentinel) |
| Preview     | `yoge-site-preview` | `8733b468-0277-477c-9991-bb56ca04a01e`                       |
| Production  | `yoge-site`         | `c085ce13-8452-434f-a330-e28fe04791f3`                       |

Both remote databases were created in APAC. Database IDs are binding identifiers,
not credentials. The local sentinel cannot identify a remote database. These
commands only check connectivity; application tables start in Phase 3:

```powershell
npx --no-install wrangler d1 execute DB --config wrangler.jsonc --local --command 'SELECT 1 AS connected'
npx --no-install wrangler d1 execute DB --env preview --remote --command 'SELECT 1 AS connected'
npx --no-install wrangler d1 execute DB --env production --remote --command 'SELECT 1 AS connected'
```

## Preview deployments

```powershell
npm run build:preview
node scripts/deploy.mjs preview check
npm run deploy:preview
npm run smoke -- https://yoge-site-preview.yoge-site.workers.dev
```

The stable review URL is
[yoge-site-preview.yoge-site.workers.dev](https://yoge-site-preview.yoge-site.workers.dev).
After the initial preview Worker exists, `npm run upload:preview` uploads a version
with its own review URL. It does not change the stable URL's active version.
Use `npm run deploy:preview` when the stable review URL should be updated.

Build each environment separately. The adapter selects bindings at build time.
The deployment wrapper checks the build marker, generated Worker name, APP_ENV,
and the single expected D1 binding. A failed build removes its deployment marker.
Do not bypass this wrapper with a raw `wrangler deploy` command.

Cloudflare initially needed a few minutes to provision the new workers.dev
hostname. The first HTTPS check failed its handshake; a subsequent check passed
with normal certificate validation. Never turn off TLS verification to work
around provisioning delays.

## Production gate and later automation

Production has an allocated D1 database but no deployed Worker. Running
`npm run deploy:production` requires a production build and an exact
`DEPLOY_APPROVAL` value of `yes, deploy`. Set that value only after Yoge gives
explicit approval for the reviewed version. Never persist it in a secret or
default environment variable: approval belongs to one deployment.

The Phase 1 CI workflow checks every main push and pull request. Deployment is
currently performed through the tested local wrapper with Wrangler OAuth.
GitHub-hosted deployment credentials, PR preview comments, production environment
reviewers, and migration steps from spec §15 are not active yet. Complete and
rehearse those before launch, once the Phase 3 migrations exist. CI does not need
Cloudflare credentials to typecheck, lint, test, or build.

For the sole-owner repository, the later production environment should require
`yogeshmanoharan-dev` as reviewer and allow the owner to review their own run.
Retain the exact deployment phrase as well as environment approval. Do not enable
automatic production deployment just by merging application code.

## Before launch

The following procedures are planned, not yet implemented or verified:

- D1 migration and local seed commands (Phase 3).
- Administrative access recovery and session revocation (Phase 4).
- Monthly D1 export, Time Travel restore, and rollback rehearsal (Phases 8–9).
- Smoke checks for health, pages, admin guard, and security headers (Phase 8).
- Daily retention cleanup and its observed logs (Phases 3 and 8).
- Dependency, link, content, and free-tier usage review (Phase 8).

Fill in exact tested commands, outputs, owners, and service URLs as each
procedure is built. Do not label these operational until a rehearsal succeeds.

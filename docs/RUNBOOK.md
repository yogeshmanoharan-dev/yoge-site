# Setup and operations

Status: Phase 0 setup guide. Application, database, deployment, backup, and
rollback commands will be added and tested in their corresponding phases.

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
in the ignored `.cache/npm` directory. Commit the eventual `package-lock.json`.
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

## Phase 1 setup checklist

- Confirm Phase 0 approval and the real GitHub repository URL.
- Resolve the Node version and pin the checked Astro/adapter/tool versions.
- Create the Astro skeleton, strict TypeScript, lint/typecheck/build scripts.
- Authenticate Wrangler through the owner's browser.
- Create separate production and preview D1 databases and bind actual IDs.
- Configure CI and verify its results.
- Review deployment configuration and request explicit "yes, deploy" before
  any production deployment, including a production hello page.

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

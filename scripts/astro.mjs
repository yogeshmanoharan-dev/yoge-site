import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [command, environment, ...args] = process.argv.slice(2);

if (!['dev', 'build', 'preview'].includes(command)) {
  throw new Error('Choose an Astro command: dev, build, or preview.');
}
if (!['local', 'preview', 'production'].includes(environment)) {
  throw new Error('Choose an environment: local, preview, or production.');
}

const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', WRANGLER_SEND_METRICS: 'false' };
if (environment === 'local') delete env.CLOUDFLARE_ENV;
else env.CLOUDFLARE_ENV = environment;

if (command === 'build') rmSync('.cache/build-environment.json', { force: true });

const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)),
    command,
    ...args,
  ],
  { stdio: 'inherit', env },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// The deployment command checks this marker against the generated Worker config.
if (command === 'build') {
  mkdirSync('.cache', { recursive: true });
  writeFileSync('.cache/build-environment.json', JSON.stringify({ environment }) + '\n');
}

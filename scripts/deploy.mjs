import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDeployment } from './deployment-guard.mjs';

const [environment, mode = 'deploy'] = process.argv.slice(2);
if (!['deploy', 'upload', 'check'].includes(mode)) throw new Error('Unknown deployment mode.');
if (mode === 'upload' && environment !== 'preview') {
  throw new Error('Version uploads are restricted to preview.');
}
const configPath = 'dist/server/wrangler.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const marker = JSON.parse(readFileSync('.cache/build-environment.json', 'utf8'));
validateDeployment({ environment, marker, config, approval: process.env.DEPLOY_APPROVAL });
console.log(`Validated ${environment}: ${config.name} with its own D1 database.`);
if (mode === 'check') process.exit(0);

const command = mode === 'upload' ? ['versions', 'upload'] : ['deploy'];
const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url)),
    ...command,
    '--config',
    configPath,
  ],
  { stdio: 'inherit', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);

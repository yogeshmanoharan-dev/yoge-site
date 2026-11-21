import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { seedSql } from '../src/db/seed.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const [target = 'local', ...extra] = process.argv.slice(2);
if (extra.length || !['local', 'preview'].includes(target))
  throw new Error('Usage: node scripts/seed.mjs [local|preview]');
const configFile = join(root, 'wrangler.jsonc');
const parsed = ts.parseConfigFileTextToJson(configFile, readFileSync(configFile, 'utf8'));
if (parsed.error) throw new Error('Invalid Wrangler configuration.');
const config = target === 'preview' ? parsed.config.env.preview : parsed.config;
const database = target === 'preview' ? 'yoge-site-preview' : 'yoge-site-local';
const id =
  target === 'preview'
    ? '8733b468-0277-477c-9991-bb56ca04a01e'
    : '00000000-0000-0000-0000-000000000000';
const bindings = config?.d1_databases;
if (
  config?.name !== database ||
  config?.vars?.APP_ENV !== target ||
  bindings?.length !== 1 ||
  bindings[0].database_name !== database ||
  bindings[0].database_id !== id ||
  bindings[0].binding !== 'DB'
) {
  throw new Error('D1 target does not match the seed environment.');
}

const cache = join(root, '.cache');
mkdirSync(cache, { recursive: true });
const directory = mkdtempSync(join(cache, 'seed-'));
const file = join(directory, 'seed.sql');
try {
  writeFileSync(file, seedSql(target), { flag: 'wx' });
  const env = { ...process.env, WRANGLER_SEND_METRICS: 'false' };
  delete env.CLOUDFLARE_ENV;
  const args = [
    join(root, 'node_modules/wrangler/bin/wrangler.js'),
    'd1',
    'execute',
    database,
    '--config',
    configFile,
    '--file',
    file,
  ];
  args.push(...(target === 'preview' ? ['--env', 'preview', '--remote', '--yes'] : ['--local']));
  const run = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
  if (run.error) throw run.error;
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(file, { force: true });
  rmdirSync(directory);
}

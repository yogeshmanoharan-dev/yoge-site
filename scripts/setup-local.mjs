import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const file = '.dev.vars';
const existing = existsSync(file) ? readFileSync(file, 'utf8') : '';
const defaults = {
  IP_HASH_SECRET: randomBytes(32).toString('hex'),
  TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
};
let output = existing;
for (const [key, value] of Object.entries(defaults)) {
  const assignment = new RegExp('^' + key + '=.*$', 'm');
  if (!assignment.test(output)) output += '\n' + key + '=' + value + '\n';
  else output = output.replace(new RegExp('^' + key + '=[ \\t]*\\r?$', 'm'), key + '=' + value);
}
if (output !== existing) writeFileSync(file, output, { mode: 0o600 });
console.log('Local D1 test settings ready in ignored .dev.vars.');

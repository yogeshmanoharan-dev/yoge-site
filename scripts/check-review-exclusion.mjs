import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const manifest = JSON.parse(readFileSync('.cache/resolved-routes.json', 'utf8'));
assert.equal(manifest.environment, 'production', 'Build production before checking exclusion.');
assert.ok(manifest.routes.length > 0, 'The route manifest must not be empty.');
assert.ok(manifest.routes.every((route) => !route.includes('styleguide')));
function checkDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) checkDirectory(path);
    else if (/\.(mjs|js|json|html|map)$/.test(entry.name)) {
      assert.doesNotMatch(readFileSync(path, 'utf8'), /\/styleguide|TODO\(yoge\)/, path);
    }
  }
}
checkDirectory('dist/server');
checkDirectory('dist/client');
console.log('PASS: production routes and bundles exclude design review pages and draft markers.');

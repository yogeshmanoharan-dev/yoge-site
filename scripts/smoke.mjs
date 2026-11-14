import assert from 'node:assert/strict';

const url = new URL(process.argv[2] ?? 'http://127.0.0.1:4321');
assert.ok(
  url.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname),
  'Remote smoke tests require HTTPS.',
);
const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
assert.equal(response.status, 200, 'Home page must return 200.');
assert.match(response.headers.get('content-type') ?? '', /text\/html/);
assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
// Cloudflare version URLs normalize this header to `noindex`.
assert.match(response.headers.get('x-robots-tag') ?? '', /\bnoindex\b/i);
assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
assert.equal(response.headers.get('set-cookie'), null, 'The hello page must not set cookies.');
const html = await response.text();
assert.match(html, /Yogesh Manoharan/);
assert.match(html, /<meta\s+name="robots"\s+content="noindex, nofollow"/);
assert.match(html, /I’m Yoge\./);
assert.match(html, /https:\/\/github\.com\/yogeshmanoharan-dev/);
assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'Exactly one main heading.');
assert.doesNotMatch(html, /TODO\(yoge\)|DEMO —/);
const css = html.match(/<link[^>]*href="([^"]+\.css)"/);
assert.ok(css, 'Page must link to its stylesheet.');
const asset = await fetch(new URL(css[1], url), { signal: AbortSignal.timeout(30_000) });
assert.equal(asset.status, 200, 'Stylesheet must load.');
assert.match(asset.headers.get('content-type') ?? '', /text\/css/);
if (url.protocol === 'https:') {
  assert.doesNotMatch(html, /<script[\s>]/i, 'The deployed hello page needs no client JavaScript.');
}
console.log(`PASS ${url.origin}: HTML, identity, links, headers, no cookies, and stylesheet.`);

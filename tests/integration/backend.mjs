import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Use Wrangler's installed simulator version even if npm also installs a second
// Miniflare version for the Astro adapter.
const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = createRequire(require.resolve('wrangler'))(
  'miniflare',
);
const serverRoot = resolve('dist/server');
const config = JSON.parse(await readFile(join(serverRoot, 'wrangler.json'), 'utf8'));
assert.equal(config.vars.APP_ENV, 'local', 'Run npm run build before this local integration test.');
const entry = config.main;
const paths = [
  entry,
  ...(await readdir(serverRoot, { recursive: true })).filter(
    (path) => path.endsWith('.mjs') && path !== entry,
  ),
];
const origin = 'http://localhost:4321';
const verifiedSiteKey = '1x00000000000000000000AA';
const verifiedSecret = '1x0000000000000000000000000000000AA';
let verifications = 0;
const runtime = new Miniflare(
  convertV4MiniflareOptions({
    modulesRoot: serverRoot,
    modules: paths.map((path) => ({ type: 'ESModule', path: join(serverRoot, path) })),
    compatibilityDate: config.compatibility_date,
    compatibilityFlags: config.compatibility_flags,
    cf: false,
    d1Databases: ['DB'],
    assets: {
      directory: resolve(serverRoot, config.assets.directory),
      binding: 'ASSETS',
      routerConfig: { has_user_worker: true },
    },
    bindings: {
      APP_ENV: 'local',
      PUBLIC_SITE_URL: origin,
      IP_HASH_SECRET: 'isolated-local-integration-key-32bytes',
      TURNSTILE_SITE_KEY: verifiedSiteKey,
      TURNSTILE_SECRET_KEY: verifiedSecret,
      NEWSLETTER_EMAILS_ENABLED: 'false',
    },
    outboundService: async (request) => {
      assert.equal(request.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
      assert.equal(request.method, 'POST');
      const fields = await request.formData();
      assert.equal(fields.get('secret'), verifiedSecret);
      verifications++;
      return Response.json(
        fields.get('response') === 'local-widget-response'
          ? { success: true, hostname: 'example.com' }
          : { success: false, 'error-codes': ['invalid-input-response'] },
      );
    },
  }),
);
const get = (path, options) =>
  runtime.dispatchFetch(origin + path, { redirect: 'manual', ...options });
const submit = (action, data, requestOrigin = origin) =>
  get('/_actions/' + action, {
    method: 'POST',
    headers: { Origin: requestOrigin },
    body: new URLSearchParams(data),
  });
const contact = {
  name: 'Integration test',
  email: 'test@example.org',
  subject: 'Local integration',
  body: 'Checking durable contact storage.',
  website: '',
  'cf-turnstile-response': 'local-widget-response',
};
const subscriber = {
  email: ' HeLLo@Example.org ',
  consent: 'on',
  source: '/newsletter',
  website: '',
  'cf-turnstile-response': 'local-widget-response',
};

try {
  await runtime.ready;
  const db = await runtime.getD1Database('DB');
  const healthBefore = await get('/api/health');
  assert.equal(healthBefore.status, 503);
  const migrations = (await readdir('migrations')).filter((path) => path.endsWith('.sql')).sort();
  for (const filename of migrations) {
    const sql = await readFile(join('migrations', filename), 'utf8');
    await db.batch(
      sql
        .split('--> statement-breakpoint')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => db.prepare(part)),
    );
  }
  const health = await get('/api/health');
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.deepEqual(healthBody, {
    ok: true,
    version: JSON.parse(await readFile('package.json', 'utf8')).version,
    db: 'ok',
  });
  assert.equal(health.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(health.headers.get('X-Frame-Options'), 'DENY');
  assert.ok(health.headers.get('Content-Security-Policy'));
  assert.ok(health.headers.get('X-Request-Id'));
  assert.equal(health.headers.get('Set-Cookie'), null);
  console.log(
    'PASS health transitions from unavailable to ready after migration; security headers and request ID present.',
  );

  assert.equal((await submit('contact.send', contact, 'https://example.org')).status, 403);
  assert.equal(
    (await submit('contact.send', { ...contact, website: 'field should be empty' })).status,
    400,
  );
  assert.equal(
    (await submit('contact.send', { ...contact, 'cf-turnstile-response': 'declined' })).status,
    400,
  );
  assert.equal(await db.prepare('SELECT count(*) FROM messages').first('count(*)'), 0);
  const sent = await submit('contact.send', contact);
  assert.equal(sent.status, 200, await sent.clone().text());
  assert.match(await sent.text(), /Your message has been received/);
  assert.deepEqual(
    await db.prepare('SELECT name,email,subject,body,status FROM messages').first(),
    {
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      body: contact.body,
      status: 'new',
    },
  );
  console.log(
    'PASS contact action persists the submitted fields; origin, honeypot and declined verification reject writes.',
  );

  const first = await submit('newsletter.subscribe', subscriber);
  assert.equal(first.status, 200, await first.clone().text());
  const repeat = await submit('newsletter.subscribe', {
    ...subscriber,
    email: 'hello@example.org',
  });
  assert.equal(repeat.status, 200);
  assert.equal(await first.text(), await repeat.text());
  const formPage = await get('/styleguide/forms', {
    method: 'POST',
    headers: { Origin: origin },
    body: new URLSearchParams({ ...subscriber, form: 'newsletter' }),
  });
  assert.equal(formPage.status, 200);
  assert.match(await formPage.text(), /when the newsletter launches/);
  assert.deepEqual(
    await db
      .prepare('SELECT email,status,source,consent_text FROM subscribers')
      .all()
      .then((r) => r.results),
    [
      {
        email: 'hello@example.org',
        status: 'pending',
        source: '/newsletter',
        consent_text:
          'I agree to receive Yoge’s newsletter by email. I can unsubscribe at any time.',
      },
    ],
  );
  const invalid = await submit('newsletter.subscribe', { ...subscriber, email: 'invalid' });
  assert.ok([400, 422].includes(invalid.status));
  assert.equal(
    verifications,
    5,
    'Only five validated, same-origin requests reached the verification service.',
  );
  for (let i = 0; i < 3; i++) {
    assert.equal(
      (await submit('contact.send', { ...contact, 'cf-turnstile-response': 'declined' })).status,
      400,
    );
  }
  assert.equal((await submit('contact.send', contact)).status, 429);
  assert.equal(await db.prepare('SELECT count(*) FROM messages').first('count(*)'), 1);
  console.log(
    'PASS duplicate newsletter signup stores one pending normalized address; sixth contact attempt is limited.',
  );

  const profile = 'https://github.com/yogeshmanoharan-dev';
  await db
    .prepare(
      "INSERT INTO social_links(id,platform,label,url,is_published) VALUES('local-gh','github','GitHub',?,1)",
    )
    .bind(profile)
    .run();
  const head = await get('/r/social/github', { method: 'HEAD' });
  assert.equal(head.status, 302);
  assert.equal(head.headers.get('Location'), profile);
  assert.equal(await db.prepare('SELECT count(*) FROM events_daily').first('count(*)'), 0);
  const redirect = await get('/r/social/github');
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get('Location'), profile);
  assert.deepEqual(await db.prepare('SELECT event,ref,count FROM events_daily').first(), {
    event: 'outbound_social',
    ref: 'github',
    count: 1,
  });
  await db.prepare('UPDATE social_links SET is_published=0 WHERE platform=?').bind('github').run();
  assert.equal((await get('/r/social/github')).status, 404);
  assert.equal(await db.prepare('SELECT count FROM events_daily').first('count'), 1);
  assert.equal((await get('/api/newsletter/confirm?token=unknown')).status, 400);
  const admin = await get('/admin');
  assert.ok(
    [401, 403, 404].includes(admin.status) ||
      ([302, 303, 307].includes(admin.status) &&
        new URL(admin.headers.get('location'), origin).pathname === '/admin/login'),
  );
  console.log(
    'PASS published redirect counts GET only; unpublished destination and invalid newsletter link are rejected; admin is inaccessible.',
  );

  await db
    .prepare(
      "INSERT INTO messages(id,name,email,subject,body,status,created_at) VALUES('expired','Integration','expired@example.org','Expired','Synthetic local retention fixture','new','2000-01-01T00:00:00.000Z')",
    )
    .run();
  await db
    .prepare(
      "INSERT INTO rate_limits(key,count,window_start,expires_at) VALUES('expired',1,'2000-01-01T00:00:00.000Z','2000-01-01T01:00:00.000Z')",
    )
    .run();
  const worker = await runtime.getWorker();
  const result = await worker.scheduled({ scheduledTime: Date.now(), cron: '17 3 * * *' });
  assert.equal(result.outcome, 'ok');
  assert.equal(
    await db.prepare("SELECT count(*) FROM messages WHERE id='expired'").first('count(*)'),
    0,
  );
  assert.equal(
    await db.prepare("SELECT count(*) FROM rate_limits WHERE key='expired'").first('count(*)'),
    0,
  );
  assert.equal(await db.prepare('SELECT count(*) FROM messages').first('count(*)'), 1);
  console.log(
    'PASS scheduled handler deletes expired records and preserves the current contact message.',
  );
} finally {
  await runtime.dispose();
}

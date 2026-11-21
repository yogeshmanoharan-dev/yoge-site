import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it, vi } from 'vitest';
import { dailyIpHash } from '../../src/lib/hash';
import { consumeRateLimit } from '../../src/lib/ratelimit';
import { safeExternalUrl, safeResourcePath } from '../../src/lib/redirect';
import { cleanupExpired } from '../../src/lib/cleanup';
import { verifyTurnstile } from '../../src/lib/turnstile';

const request = new Request('https://site.example/', {
  headers: { 'CF-Connecting-IP': '192.0.2.1' },
});
const secret = 'unit-test-secret';

describe('daily visitor limits', () => {
  it('rotates hashes every UTC day and scopes them to the site secret', async () => {
    const first = await dailyIpHash(secret, '192.0.2.1', '2026-11-20');
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(await dailyIpHash(secret, '192.0.2.1', '2026-11-20')).toBe(first);
    expect(await dailyIpHash(secret, '192.0.2.1', '2026-11-21')).not.toBe(first);
    expect(await dailyIpHash('second-site', '192.0.2.1', '2026-11-20')).not.toBe(first);
    expect(await dailyIpHash(secret, '192.0.2.2', '2026-11-20')).not.toBe(first);
  });

  it('enforces five admissions under concurrent requests, scoped by action and hour', async () => {
    using sqlite = new DatabaseSync(':memory:');
    sqlite.exec(
      'CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER, window_start TEXT, expires_at TEXT)',
    );
    const db = {
      prepare: (sql: string) => ({
        bind: (...values: string[]) => ({
          first: async () => sqlite.prepare(sql).get(...values) ?? null,
        }),
      }),
    } as unknown as D1Database;
    const env = { DB: db, IP_HASH_SECRET: secret, APP_ENV: 'preview' } as const;
    const now = Date.parse('2026-11-20T23:59:59.000Z');
    const results = await Promise.all(
      Array.from({ length: 9 }, () => consumeRateLimit(env, request, 'contact', now)),
    );
    expect(results.filter(Boolean)).toHaveLength(5);
    expect(await consumeRateLimit(env, request, 'newsletter', now)).toBe(true);
    expect(await consumeRateLimit(env, request, 'contact', now + 1000)).toBe(true);
    expect(JSON.stringify(sqlite.prepare('SELECT * FROM rate_limits').all())).not.toContain(
      '192.0.2.1',
    );
    expect(await consumeRateLimit(env, new Request(request.url), 'contact', now)).toBe(false);
  });
});

describe('Turnstile server verification', () => {
  const env = {
    APP_ENV: 'production',
    PUBLIC_SITE_URL: 'https://site.example/',
    TURNSTILE_SITE_KEY: 'unit-site',
    TURNSTILE_SECRET_KEY: 'unit-secret',
  } as const;
  const dummy = {
    ...env,
    APP_ENV: 'preview',
    TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  } as const;
  const result = (body: unknown) => vi.fn(async () => Response.json(body));

  it('accepts only the verified form action and hostname for a real widget', async () => {
    const good = { success: true, hostname: 'site.example', action: 'contact' };
    expect(await verifyTurnstile(env, 'unit-token', 'contact', result(good))).toBe(true);
    expect(await verifyTurnstile(env, 'unit-token', 'newsletter', result(good))).toBe(false);
    expect(
      await verifyTurnstile(
        env,
        'unit-token',
        'contact',
        result({ ...good, hostname: 'wrong.example' }),
      ),
    ).toBe(false);
    expect(
      await verifyTurnstile(env, 'unit-token', 'contact', result({ ...good, success: false })),
    ).toBe(false);
    expect(
      await verifyTurnstile(env, 'unit-token', 'contact', async () => {
        throw new Error('offline');
      }),
    ).toBe(false);
  });

  it('accepts the documented dummy verification only with paired testing keys off production', async () => {
    const verify = result({ success: true, hostname: 'example.com' });
    expect(await verifyTurnstile(dummy, 'XXXX.DUMMY.TOKEN.XXXX', 'contact', verify)).toBe(true);
    expect(
      await verifyTurnstile(
        { ...dummy, APP_ENV: 'production' },
        'XXXX.DUMMY.TOKEN.XXXX',
        'contact',
        verify,
      ),
    ).toBe(false);
    expect(
      await verifyTurnstile(
        { ...dummy, TURNSTILE_SITE_KEY: 'live-site' },
        'unit-token',
        'contact',
        verify,
      ),
    ).toBe(false);
    expect(verify).toHaveBeenCalledTimes(1);
  });
});

describe('stored redirect destinations', () => {
  it('requires the profile platform or an owner-configured HTTPS website', () => {
    expect(safeExternalUrl('https://www.linkedin.com/in/profile', 'linkedin')).toBe(
      'https://www.linkedin.com/in/profile',
    );
    expect(safeExternalUrl('https://example.org/article', 'website')).toBe(
      'https://example.org/article',
    );
    expect(safeExternalUrl('https://example.org/article', 'github')).toBeNull();
    expect(safeExternalUrl('http://example.org')).toBeNull();
    expect(safeExternalUrl('https://name:password@example.org')).toBeNull();
  });
  it('keeps encoded file names under the resources directory', () => {
    expect(safeResourcePath('/resources/guides/Field notes.pdf')).toBe(
      '/resources/guides/Field%20notes.pdf',
    );
    expect(safeResourcePath('/resources/guides/Field%20notes.pdf')).toBe(
      '/resources/guides/Field%20notes.pdf',
    );
    expect(safeResourcePath('/other/notes.pdf')).toBeNull();
    expect(safeResourcePath('/resources/../notes.pdf')).toBeNull();
    expect(safeResourcePath('/resources/guides/')).toBeNull();
  });
});

describe('scheduled retention', () => {
  it('preserves messages on the leap-day retention boundary and removes expired sessions and limits', async () => {
    using sqlite = new DatabaseSync(':memory:');
    sqlite.exec(`
      CREATE TABLE messages(created_at TEXT);
      CREATE TABLE admin_sessions(expires_at TEXT);
      CREATE TABLE rate_limits(expires_at TEXT);
      INSERT INTO messages VALUES ('2023-02-28T11:00:00.000Z'), ('2023-02-28T12:00:00.000Z');
      INSERT INTO admin_sessions VALUES ('2024-02-29T12:00:00.000Z'), ('2024-02-29T13:00:00.000Z');
      INSERT INTO rate_limits SELECT * FROM admin_sessions;
    `);
    const db = {
      prepare: (sql: string) => ({ bind: (value: string) => () => sqlite.prepare(sql).run(value) }),
      batch: async (statements: (() => unknown)[]) => statements.map((run) => run()),
    } as unknown as D1Database;
    await cleanupExpired(db, new Date('2024-02-29T12:00:00.000Z'));
    expect(sqlite.prepare('SELECT * FROM messages').all()).toEqual([
      { created_at: '2023-02-28T12:00:00.000Z' },
    ]);
    for (const table of ['admin_sessions', 'rate_limits']) {
      expect(sqlite.prepare('SELECT expires_at FROM ' + table).all()).toEqual([
        { expires_at: '2024-02-29T13:00:00.000Z' },
      ]);
    }
  });
});

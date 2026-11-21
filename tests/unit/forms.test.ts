import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlatformProxy } from 'wrangler';
import { contactInput, newsletterConsent, subscriberInput } from '../../src/lib/validators';
import { subscribe, useNewsletterLink, newsletterLinkResponse } from '../../src/lib/newsletter';
import { sendEmail } from '../../src/lib/email';
import type { getBackendEnv } from '../../src/lib/env';

vi.mock('../../src/lib/email', () => ({ sendEmail: vi.fn() }));

const person = {
  name: 'Example',
  email: '  Example@Example.ORG ',
  subject: 'Question',
  body: 'A valid test message.',
  'cf-turnstile-response': 'widget-response',
};

it('normalizes addresses and validates message boundaries and consent', () => {
  expect(contactInput.parse(person).email).toBe('example@example.org');
  for (const fields of [
    { name: ' ' },
    { name: 'x'.repeat(81) },
    { subject: 'x'.repeat(121) },
    { subject: 'line\nbreak' },
    { body: 'too short' },
    { body: 'x'.repeat(5001) },
    { email: 'missing-domain' },
  ]) {
    expect(contactInput.safeParse({ ...person, ...fields }).success).toBe(false);
  }
  expect(subscriberInput.safeParse(person).success).toBe(false);
  expect(subscriberInput.parse({ ...person, consent: 'on' }).source).toBe('/newsletter');
});

describe('newsletter token lifecycle in local D1', () => {
  let backend: ReturnType<typeof getBackendEnv>;
  let dispose: () => Promise<void>;
  const email = 'newsletter-test@example.org';
  const deliver = vi.mocked(sendEmail);
  beforeAll(async () => {
    const proxy = await getPlatformProxy<{ DB: D1Database }>({
      configPath: 'wrangler.jsonc',
      persist: false,
    });
    dispose = proxy.dispose;
    backend = {
      DB: proxy.env.DB,
      APP_ENV: 'local',
      PUBLIC_SITE_URL: 'http://localhost:4321',
      IP_HASH_SECRET: 'local-test-only',
      TURNSTILE_SITE_KEY: 'unused',
      TURNSTILE_SECRET_KEY: 'unused',
      EMAIL_FROM: 'test@example.org',
      RESEND_API_KEY: 'test-only',
      NEWSLETTER_EMAILS_ENABLED: true,
    };
    const migration = await readFile(
      new URL('../../migrations/0000_backend_core.sql', import.meta.url),
      'utf8',
    );
    await backend.DB.batch(
      migration
        .split('--> statement-breakpoint')
        .map((sql) => sql.trim())
        .filter(Boolean)
        .map((sql) => backend.DB.prepare(sql)),
    );
    await backend.DB.prepare(
      "INSERT INTO site_settings (key,value) VALUES ('newsletter_emails_enabled','true')",
    ).run();
  }, 30000);
  afterAll(async () => {
    await dispose?.();
  });
  beforeEach(async () => {
    await backend.DB.prepare('DELETE FROM subscribers').run();
    deliver.mockReset().mockResolvedValue(true);
  });

  function emailedToken(kind: 'confirm' | 'unsubscribe') {
    const text = deliver.mock.lastCall![1].text;
    const link = text.split('\n').find((line) => line.includes('/api/newsletter/' + kind + '?'))!;
    return new URL(link).searchParams.get('token')!;
  }
  it('records pending consent once when delivery is disabled', async () => {
    const disabled = { ...backend, NEWSLETTER_EMAILS_ENABLED: false };
    const first = await subscribe(disabled, email, '/newsletter');
    expect(await subscribe(disabled, email, '/')).toEqual(first);
    expect(
      await backend.DB.prepare(
        'SELECT status,source,consent_text,confirm_token_hash FROM subscribers',
      ).first(),
    ).toEqual({
      status: 'pending',
      source: '/newsletter',
      consent_text: newsletterConsent,
      confirm_token_hash: null,
    });
    expect(deliver).not.toHaveBeenCalled();
  });
  it('claims one delivery, consumes confirmation once, and honours unsubscribe first or last', async () => {
    const responses = await Promise.all([
      subscribe(backend, email, '/'),
      subscribe(backend, email, '/'),
    ]);
    expect(responses[0]).toEqual(responses[1]);
    expect(deliver).toHaveBeenCalledTimes(1);
    const confirm = emailedToken('confirm');
    const unsubscribeToken = emailedToken('unsubscribe');
    const row = await backend.DB.prepare(
      'SELECT confirm_token_hash,unsubscribe_token_hash FROM subscribers',
    ).first();
    expect(row?.confirm_token_hash).not.toBe(confirm);
    expect(row?.unsubscribe_token_hash).not.toBe(unsubscribeToken);
    expect(await useNewsletterLink(backend.DB, 'confirm', confirm)).toBe(true);
    expect(await useNewsletterLink(backend.DB, 'confirm', confirm)).toBe(false);
    expect(await subscribe(backend, email, '/newsletter')).toEqual(responses[0]);
    expect(deliver).toHaveBeenCalledTimes(1);
    expect(await useNewsletterLink(backend.DB, 'unsubscribe', unsubscribeToken)).toBe(true);
    expect(await backend.DB.prepare('SELECT status FROM subscribers').first('status')).toBe(
      'unsubscribed',
    );
    await subscribe(backend, email, '/');
    const newToken = emailedToken('confirm');
    expect(newToken).not.toBe(confirm);
    expect(await useNewsletterLink(backend.DB, 'unsubscribe', emailedToken('unsubscribe'))).toBe(
      true,
    );
    expect(await useNewsletterLink(backend.DB, 'confirm', newToken)).toBe(false);
  });
  it('rejects expired and ambiguous links and reissues after expiry', async () => {
    await subscribe(backend, email, '/');
    const old = emailedToken('confirm');
    await backend.DB.prepare('UPDATE subscribers SET confirm_expires_at=?')
      .bind(new Date(0).toISOString())
      .run();
    expect(await useNewsletterLink(backend.DB, 'confirm', old)).toBe(false);
    await subscribe(backend, email, '/newsletter');
    const token = emailedToken('confirm');
    expect(token).not.toBe(old);
    const url = new URL(backend.PUBLIC_SITE_URL);
    url.searchParams.append('token', token);
    url.searchParams.append('token', old);
    expect((await newsletterLinkResponse(backend.DB, 'confirm', url)).status).toBe(400);
    expect(await useNewsletterLink(backend.DB, 'confirm', token)).toBe(true);
  });
  it('releases an unconfirmed delivery for retry after a provider outage', async () => {
    deliver.mockRejectedValueOnce(new Error('Simulated provider outage'));
    const first = await subscribe(backend, email, '/');
    expect(
      await backend.DB.prepare('SELECT confirm_token_hash FROM subscribers').first(
        'confirm_token_hash',
      ),
    ).toBeNull();
    expect(await subscribe(backend, email, '/')).toEqual(first);
    expect(deliver).toHaveBeenCalledTimes(2);
    expect(await useNewsletterLink(backend.DB, 'confirm', emailedToken('confirm'))).toBe(true);
  });
});

import { z } from 'zod';
import { isTurnstileTestKey } from './turnstile';

const optional = <T extends z.ZodType<string>>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());
const bindings = z
  .object({
    APP_ENV: z.enum(['local', 'preview', 'production']),
    DB: z.custom<D1Database>(
      (value) => !!value && typeof (value as D1Database).prepare === 'function',
    ),
    PUBLIC_SITE_URL: z.url(),
    IP_HASH_SECRET: z.string().min(32),
    TURNSTILE_SITE_KEY: z.string().trim().min(1),
    TURNSTILE_SECRET_KEY: z.string().trim().min(1),
    RESEND_API_KEY: optional(z.string().min(1)),
    ALERT_EMAIL_TO: optional(z.email()),
    EMAIL_FROM: optional(z.email()),
    NEWSLETTER_EMAILS_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .refine(
    (env) => {
      const url = new URL(env.PUBLIC_SITE_URL);
      return (
        url.origin === env.PUBLIC_SITE_URL &&
        (url.protocol === 'https:' ||
          (env.APP_ENV === 'local' &&
            url.protocol === 'http:' &&
            ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)))
      );
    },
    { path: ['PUBLIC_SITE_URL'], message: 'Expected a trusted site origin.' },
  )
  .refine(
    (env) => {
      const siteTest = isTurnstileTestKey(env.TURNSTILE_SITE_KEY);
      return (
        siteTest === isTurnstileTestKey(env.TURNSTILE_SECRET_KEY) &&
        (!siteTest || env.APP_ENV === 'local')
      );
    },
    { path: ['TURNSTILE_SITE_KEY'], message: 'Hosted forms require a real Turnstile widget.' },
  )
  .refine((env) => !env.RESEND_API_KEY || !!env.EMAIL_FROM, {
    path: ['EMAIL_FROM'],
    message: 'Email delivery requires a sender.',
  })
  .refine(
    (env) =>
      !env.NEWSLETTER_EMAILS_ENABLED ||
      (!!env.RESEND_API_KEY && !!env.EMAIL_FROM && !env.EMAIL_FROM.endsWith('@resend.dev')),
    {
      path: ['NEWSLETTER_EMAILS_ENABLED'],
      message: 'Newsletter delivery requires a verified sender.',
    },
  );

export function getBackendEnv(raw: unknown) {
  const parsed = bindings.safeParse(raw);
  if (!parsed.success) {
    // Configuration errors can be logged safely without echoing binding values.
    throw new Error(
      'Invalid backend settings: ' +
        [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))].join(', '),
    );
  }
  return parsed.data;
}

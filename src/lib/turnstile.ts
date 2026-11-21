import { z } from 'zod';
import type { FormAction } from './ratelimit';

interface TurnstileEnv {
  APP_ENV: 'local' | 'preview' | 'production';
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;
  PUBLIC_SITE_URL: string;
}

const resultSchema = z.object({
  success: z.literal(true),
  hostname: z.string(),
  action: z.string().optional(),
});

export function isTurnstileTestKey(key: string): boolean {
  return /^[123]x0+(?:AA|AB|BB|FF)$/.test(key);
}

export async function verifyTurnstile(
  env: TurnstileEnv,
  token: string,
  action: FormAction,
  send: typeof fetch = fetch,
): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  const testSite = isTurnstileTestKey(env.TURNSTILE_SITE_KEY);
  const testSecret = isTurnstileTestKey(env.TURNSTILE_SECRET_KEY);
  if (testSite !== testSecret || (testSecret && env.APP_ENV === 'production')) return false;
  try {
    const response = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const verified = resultSchema.safeParse(await response.json());
    if (!verified.success) return false;
    if (testSecret) {
      // Siteverify's documented response to official test keys omits action.
      return verified.data.hostname === 'example.com' && verified.data.action === undefined;
    }
    return (
      verified.data.hostname === new URL(env.PUBLIC_SITE_URL).hostname &&
      verified.data.action === action
    );
  } catch {
    // A timeout or invalid response cannot authorize a form write.
    return false;
  }
}

import type { getBackendEnv } from './env';

type EmailSettings = Pick<ReturnType<typeof getBackendEnv>, 'RESEND_API_KEY' | 'EMAIL_FROM'>;
type Email = { to: string; subject: string; text: string; reply_to?: string };

/** Sends plain text, with a stable key to deduplicate provider retries. */
export async function sendEmail(settings: EmailSettings, mail: Email, idempotencyKey: string) {
  if (!settings.RESEND_API_KEY || !settings.EMAIL_FROM) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
    headers: {
      Authorization: `Bearer ${settings.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ from: settings.EMAIL_FROM, ...mail }),
  });
  if (!response.ok) throw new Error('Email delivery request failed.');
  return true;
}

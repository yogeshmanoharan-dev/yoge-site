import type { getBackendEnv } from './env';
import { sendEmail } from './email';
import { newsletterConsent, newsletterToken } from './validators';

type Backend = ReturnType<typeof getBackendEnv>;
const week = 7 * 24 * 60 * 60 * 1000;
const waitingMessage = "You're on the list. I'll email you when the newsletter launches.";
const confirmMessage = 'If your address needs confirmation, check your inbox.';

function hex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function digest(token: string) {
  return hex(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))),
  );
}

export async function subscribe(backend: Backend, email: string, source: string) {
  const db = backend.DB;
  const id = crypto.randomUUID();
  const now = new Date();
  const enabled =
    backend.NEWSLETTER_EMAILS_ENABLED &&
    (await db
      .prepare("SELECT value FROM site_settings WHERE key = 'newsletter_emails_enabled'")
      .first<string>('value')) === 'true';

  if (!enabled) {
    await db
      .prepare(
        `INSERT INTO subscribers (id,email,status,consent_text,source,created_at)
        VALUES (?,?,'pending',?,?,?) ON CONFLICT(email) DO NOTHING`,
      )
      .bind(id, email, newsletterConsent, source, now.toISOString())
      .run();
    return { message: waitingMessage };
  }

  const confirmation = hex(crypto.getRandomValues(new Uint8Array(32)));
  const unsubscribe = hex(crypto.getRandomValues(new Uint8Array(32)));
  const confirmHash = await digest(confirmation);
  // Claim one delivery atomically. A duplicate cannot replace a usable link, send
  // a second email, or move a confirmed subscriber back into the pending state.
  const claimed = await db
    .prepare(
      `INSERT INTO subscribers
      (id,email,status,consent_text,source,created_at,confirm_token_hash,confirm_expires_at,unsubscribe_token_hash)
      VALUES (?,?,'pending',?,?,?,?,?,?)
      ON CONFLICT(email) DO UPDATE SET status='pending', consent_text=excluded.consent_text,
        source=excluded.source, confirm_token_hash=excluded.confirm_token_hash,
        confirm_expires_at=excluded.confirm_expires_at, unsubscribe_token_hash=excluded.unsubscribe_token_hash,
        confirmed_at=NULL
      WHERE subscribers.status <> 'subscribed' AND
        (subscribers.confirm_token_hash IS NULL OR subscribers.confirm_expires_at <= excluded.created_at)
      RETURNING id`,
    )
    .bind(
      id,
      email,
      newsletterConsent,
      source,
      now.toISOString(),
      confirmHash,
      new Date(now.getTime() + week).toISOString(),
      await digest(unsubscribe),
    )
    .first<{ id: string }>();
  if (claimed) {
    const confirmUrl = new URL('/api/newsletter/confirm', backend.PUBLIC_SITE_URL);
    confirmUrl.searchParams.set('token', confirmation);
    const unsubscribeUrl = new URL('/api/newsletter/unsubscribe', backend.PUBLIC_SITE_URL);
    unsubscribeUrl.searchParams.set('token', unsubscribe);
    try {
      const delivered = await sendEmail(
        backend,
        {
          to: email,
          subject: 'Confirm your subscription to Yoge’s newsletter',
          text: `You requested Yoge’s newsletter. Confirm within seven days:\n${confirmUrl}\n\nTo unsubscribe:\n${unsubscribeUrl}`,
        },
        `newsletter-${confirmHash}`,
      );
      if (!delivered) throw new Error('Mail configuration unavailable.');
    } catch {
      // Release only our claim. Preserve generic responses even during outages.
      console.warn('Newsletter confirmation delivery could not be verified.');
      await db
        .prepare(
          `UPDATE subscribers SET confirm_token_hash=NULL,confirm_expires_at=NULL
        WHERE id=? AND status='pending' AND confirm_token_hash=?`,
        )
        .bind(claimed.id, confirmHash)
        .run();
    }
  }
  return { message: confirmMessage };
}

export async function useNewsletterLink(
  db: D1Database,
  kind: 'confirm' | 'unsubscribe',
  token: unknown,
) {
  const parsed = newsletterToken.safeParse(token);
  if (!parsed.success) return false;
  const hash = await digest(parsed.data);
  const now = new Date().toISOString();
  const update =
    kind === 'confirm'
      ? db
          .prepare(
            `UPDATE subscribers SET status='subscribed', confirmed_at=?, confirm_token_hash=NULL,
        confirm_expires_at=NULL WHERE status='pending' AND confirm_token_hash=? AND confirm_expires_at > ?`,
          )
          .bind(now, hash, now)
      : db
          .prepare(
            `UPDATE subscribers SET status='unsubscribed', confirmed_at=NULL, confirm_token_hash=NULL,
        confirm_expires_at=NULL WHERE unsubscribe_token_hash=?`,
          )
          .bind(hash);
  return (await update.run()).meta.changes > 0;
}

export async function newsletterLinkResponse(
  db: D1Database,
  kind: 'confirm' | 'unsubscribe',
  url: URL,
) {
  // Prevent a mail client, proxy, or browser from caching the result of a bearer link.
  const headers = {
    'Cache-Control': 'private, no-store',
    'Referrer-Policy': 'no-referrer',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow',
  };
  const tokens = url.searchParams.getAll('token');
  if (tokens.length !== 1 || !(await useNewsletterLink(db, kind, tokens[0]))) {
    return new Response('This link is invalid or has expired.', { status: 400, headers });
  }
  return new Response(
    kind === 'confirm' ? 'Your newsletter subscription is confirmed.' : 'You have unsubscribed.',
    { headers },
  );
}

import { dailyIpHash } from './hash';

export type FormAction = 'contact' | 'newsletter';
const hour = 60 * 60 * 1000;

interface RateLimitEnv {
  DB: D1Database;
  IP_HASH_SECRET: string;
  APP_ENV: 'local' | 'preview' | 'production';
}

export async function consumeRateLimit(
  env: RateLimitEnv,
  request: Request,
  action: FormAction,
  now = Date.now(),
): Promise<boolean> {
  // Cloudflare supplies this header at the edge. Local requests share one bucket.
  const ip = request.headers.get('CF-Connecting-IP') || (env.APP_ENV === 'local' ? 'local' : '');
  if (!ip) return false;
  const start = Math.floor(now / hour) * hour;
  const windowStart = new Date(start).toISOString();
  const hash = await dailyIpHash(env.IP_HASH_SECRET, ip, windowStart.slice(0, 10));
  const key = [action, hash, start].join(':');
  // Check and increment in one SQLite statement, including for concurrent requests.
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, window_start, expires_at) VALUES (?, 1, ?, ?)
     ON CONFLICT (key) DO UPDATE SET count = count + 1 WHERE count < 5 RETURNING count`,
  )
    .bind(key, windowStart, new Date(start + hour).toISOString())
    .first<{ count: number }>();
  return row !== null;
}

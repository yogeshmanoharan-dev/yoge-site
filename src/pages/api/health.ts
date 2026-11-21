import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { version } from '../../../package.json';

export const GET: APIRoute = async () => {
  let available = false;
  try {
    available = (await env.DB.prepare('SELECT 1 AS ok FROM site_settings LIMIT 1').all()).success;
  } catch {
    // The caller only needs readiness, not binding or schema details.
  }
  return Response.json(
    { ok: available, version, db: available ? 'ok' : 'unavailable' },
    {
      status: available ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
};

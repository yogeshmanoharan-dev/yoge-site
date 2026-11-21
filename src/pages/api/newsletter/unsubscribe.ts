import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { newsletterLinkResponse } from '../../../lib/newsletter';

export const GET: APIRoute = ({ url }) => newsletterLinkResponse(env.DB, 'unsubscribe', url);
export const POST: APIRoute = GET;
export const HEAD: APIRoute = () =>
  new Response(null, { headers: { 'Cache-Control': 'no-store' } });

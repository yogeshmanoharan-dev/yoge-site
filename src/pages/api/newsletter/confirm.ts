import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { newsletterLinkResponse } from '../../../lib/newsletter';

export const GET: APIRoute = ({ url }) => newsletterLinkResponse(env.DB, 'confirm', url);
// Astro falls back to GET for HEAD unless explicitly handled. A link preview
// checking headers must not redeem the token.
export const HEAD: APIRoute = () =>
  new Response(null, { headers: { 'Cache-Control': 'no-store' } });

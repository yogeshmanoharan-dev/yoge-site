import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { redirectToPublished } from '../../../lib/redirect';

export const GET: APIRoute = ({ params, request }) =>
  redirectToPublished(env.DB, params, request.method);
export const HEAD = GET;

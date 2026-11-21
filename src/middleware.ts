import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const requestId = crypto.randomUUID();
  context.locals.requestId = requestId;
  let response: Response;
  try {
    response = await next();
  } catch {
    response = new Response('Temporarily unavailable.', { status: 500 });
  }
  if (response.status >= 500)
    console.error('Request failed', { requestId, status: response.status });
  const result = new Response(response.body, response);
  result.headers.set('X-Request-Id', requestId);
  result.headers.set('X-Content-Type-Options', 'nosniff');
  result.headers.set('X-Frame-Options', 'DENY');
  result.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!result.headers.has('Referrer-Policy'))
    result.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (context.url.protocol === 'https:')
    result.headers.set('Strict-Transport-Security', 'max-age=31536000');
  // Astro adds the page-specific script and stylesheet hashes. Ancestor restrictions require a header.
  result.headers.append(
    'Content-Security-Policy',
    "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  );
  if (context.url.pathname.startsWith('/_actions/') || context.url.pathname.startsWith('/api/'))
    result.headers.set('Cache-Control', 'no-store');
  return result;
});

import { z } from 'zod';

const platforms: ReadonlyMap<string, readonly string[]> = new Map([
  ['youtube', ['youtube.com', 'youtu.be']],
  ['instagram', ['instagram.com']],
  ['linkedin', ['linkedin.com']],
  ['x', ['x.com', 'twitter.com']],
  ['github', ['github.com']],
  ['facebook', ['facebook.com', 'fb.com']],
  ['threads', ['threads.com', 'threads.net']],
  ['medium', ['medium.com']],
  ['reddit', ['reddit.com', 'redd.it']],
  ['discord', ['discord.com', 'discord.gg']],
  ['fiverr', ['fiverr.com']],
  ['upwork', ['upwork.com']],
  // These platforms permit owner-configured HTTPS destinations.
  ['email', []],
  ['website', []],
  ['other', []],
]);

export function safeExternalUrl(raw: string, platform?: string): string | null {
  if (!URL.canParse(raw) || /\s|\\/.test(raw)) return null;
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  if (platform !== undefined) {
    const domains = platforms.get(platform);
    if (
      !domains ||
      (domains.length &&
        !domains.some((domain) => url.hostname === domain || url.hostname.endsWith('.' + domain)))
    )
      return null;
  }
  return url.href;
}

export function safeResourcePath(raw: string): string | null {
  if (!raw.startsWith('/resources/') || raw.endsWith('/') || /[?#\\]/.test(raw)) return null;
  // Check each decoded segment so encoded slashes cannot change the path.
  try {
    const segments = raw.slice('/resources/'.length).split('/').map(decodeURIComponent);
    if (
      segments.some(
        (segment) =>
          !segment ||
          segment === '.' ||
          segment === '..' ||
          /[/\\%]/.test(segment) ||
          Array.from(segment).some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127),
      )
    ) {
      return null;
    }
    return '/resources/' + segments.map(encodeURIComponent).join('/');
  } catch {
    return null;
  }
}

const requests = z.object({
  kind: z.enum(['resource', 'social', 'content']),
  ref: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/),
});

const sources = {
  resource: {
    query: 'SELECT file_path AS target FROM resources WHERE slug = ? AND is_published = 1',
    event: 'resource_download',
  },
  social: {
    query: 'SELECT url AS target FROM social_links WHERE platform = ? AND is_published = 1',
    event: 'outbound_social',
  },
  content: {
    query: 'SELECT url AS target FROM content_items WHERE id = ? AND is_published = 1',
    event: 'outbound_content',
  },
} as const;

export async function redirectToPublished(
  db: D1Database,
  params: unknown,
  method: string,
): Promise<Response> {
  const notFound = () =>
    new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  const parsed = requests.safeParse(params);
  if (!parsed.success) return notFound();
  const { kind, ref } = parsed.data;
  const { query, event } = sources[kind];
  const target = await db.prepare(query).bind(ref).first<string>('target');
  if (!target) return notFound();
  const location =
    kind === 'resource'
      ? safeResourcePath(target)
      : safeExternalUrl(target, kind === 'social' ? ref : undefined);
  if (!location) return notFound();
  if (method === 'GET') {
    const day = new Date().toISOString().slice(0, 10);
    await db
      .prepare(
        `INSERT INTO events_daily(day, event, ref, count) VALUES (?, ?, ?, 1)
       ON CONFLICT(day, event, ref) DO UPDATE SET count = count + 1`,
      )
      .bind(day, event, ref)
      .run();
  }
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'Cache-Control': 'no-store' },
  });
}

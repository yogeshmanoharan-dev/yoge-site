// Used only by the seed command. The inputs are public, owner-approved defaults.
import { sql } from 'drizzle-orm';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';
import { brand } from '../lib/brand.ts';
import { platforms } from './schema.ts';

const settings = {
  hero_eyebrow: 'YOGESH MANOHARAN — YOGE',
  hero_headline: brand.heroHeadline,
  hero_subline: brand.heroSubline,
  about_short: brand.aboutParagraphs,
  primary_cta: brand.primaryCta,
  secondary_cta: brand.secondaryCta,
  availability_note: '',
  seo_defaults: { title: 'Yoge — Yogesh Manoharan', description: brand.heroSubline },
  newsletter_emails_enabled: false,
  kind_words_enabled: false,
};
const labels = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  instagram: 'Instagram',
  x: 'X',
  facebook: 'Facebook',
  threads: 'Threads',
  medium: 'Medium',
  reddit: 'Reddit',
  discord: 'Discord',
  fiverr: 'Fiverr',
  upwork: 'Upwork',
  email: 'Email',
  website: 'Website',
  other: 'Other',
} as const;
const urls: Partial<Record<(typeof platforms)[number], string>> = {
  github: 'https://github.com/yogeshmanoharan-dev',
  linkedin: 'https://www.linkedin.com/in/yogesh-manoharan-5512a144b',
};

export function seedSql(target: 'local' | 'preview') {
  const statements = Object.entries(settings).map(
    ([key, value]) =>
      sql`INSERT INTO site_settings (key,value) VALUES (${key},${JSON.stringify(value)}) ON CONFLICT(key) DO NOTHING`,
  );
  // TODO(yoge): supply the remaining platform URLs in admin. Local drafts have blank URLs.
  for (const [sortOrder, platform] of (
    ['github', 'linkedin', ...platforms.filter((platform) => !urls[platform])] as const
  ).entries()) {
    const url = urls[platform];
    if (!url && target === 'preview') continue;
    statements.push(sql`INSERT INTO social_links
      (id,platform,label,url,is_published,is_primary,sort_order)
      VALUES (${crypto.randomUUID()},${platform},${labels[platform]},${url ?? ''},${url ? 1 : 0},${url ? 1 : 0},${sortOrder})
      ON CONFLICT(platform) DO NOTHING`);
  }
  // Wrangler file imports take SQLite text. Drizzle quotes every bound string.
  const dialect = new SQLiteSyncDialect();
  return statements
    .map((statement) => dialect.sqlToQuery(statement.inlineParams()).sql + ';')
    .join('\n');
}

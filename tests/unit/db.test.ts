import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { brand } from '../../src/lib/brand';
import { seedSql } from '../../src/db/seed';

let db: DatabaseSync;
beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../../migrations/0000_backend_core.sql', import.meta.url), 'utf8'));
});
afterEach(() => db.close());

it('seeds the approved copy, only two published links and empty local drafts', () => {
  db.exec(seedSql('local'));
  expect(db.prepare("SELECT value FROM site_settings WHERE key = 'about_short'").get()?.value).toBe(
    JSON.stringify(brand.aboutParagraphs),
  );
  expect(
    db
      .prepare('SELECT url FROM social_links WHERE is_published = 1 ORDER BY sort_order')
      .all()
      .map((row) => row.url),
  ).toEqual([
    'https://github.com/yogeshmanoharan-dev',
    'https://www.linkedin.com/in/yogesh-manoharan-5512a144b',
  ]);
  expect(
    db
      .prepare("SELECT count(*) AS total FROM social_links WHERE is_published = 0 AND url = ''")
      .get()?.total,
  ).toBe(13);
  expect(
    db
      .prepare(
        'SELECT (SELECT count(*) FROM projects)+(SELECT count(*) FROM testimonials)+(SELECT count(*) FROM resources)+(SELECT count(*) FROM content_items) AS total',
      )
      .get()?.total,
  ).toBe(0);
});

it('preserves profile edits, disabled links and changed copy when re-seeded', () => {
  db.exec(seedSql('local'));
  const id = db.prepare("SELECT id FROM social_links WHERE platform='github'").get()?.id;
  db.exec(
    `UPDATE site_settings SET value='"Updated"' WHERE key='hero_headline'; UPDATE social_links SET label='Changed',is_published=0 WHERE platform='github'`,
  );
  db.exec(seedSql('local'));
  expect(
    db.prepare("SELECT id,label,is_published FROM social_links WHERE platform='github'").get(),
  ).toEqual({ id, label: 'Changed', is_published: 0 });
  expect(db.prepare("SELECT value FROM site_settings WHERE key='hero_headline'").get()?.value).toBe(
    '"Updated"',
  );
  expect(db.prepare('SELECT count(*) AS total FROM social_links').get()?.total).toBe(15);
});

it('seeds only verified profiles on preview', () => {
  db.exec(seedSql('preview'));
  expect(db.prepare('SELECT count(*) AS total FROM social_links').get()?.total).toBe(2);
  expect(
    db.prepare("SELECT value FROM site_settings WHERE key='newsletter_emails_enabled'").get()
      ?.value,
  ).toBe('false');
});

it('requires consent and a source for publishing an existing testimonial draft', () => {
  db.exec(
    "INSERT INTO testimonials (id,quote,author_name,source_platform) VALUES ('fixture','Test only','Test','other')",
  );
  expect(() => db.exec('UPDATE testimonials SET is_published=1')).toThrow(
    /testimonial_publication/,
  );
  expect(() => db.exec('UPDATE testimonials SET permission_confirmed=1,is_published=1')).toThrow(
    /testimonial_publication/,
  );
  db.exec(
    "UPDATE testimonials SET permission_confirmed=1,source_url='https://example.org/test',is_published=1",
  );
  expect(db.prepare('SELECT is_published FROM testimonials').get()?.is_published).toBe(1);
});

it('uses indexes for public order, recipient lookup and retention', () => {
  for (const query of [
    'SELECT id FROM social_links WHERE is_published=1 ORDER BY sort_order,id',
    "SELECT id FROM subscribers WHERE confirm_token_hash='fixture'",
    "SELECT id FROM messages WHERE created_at<'2021-01-01T00:00:00.000Z'",
  ]) {
    const plan = db
      .prepare('EXPLAIN QUERY PLAN ' + query)
      .all()
      .map((row) => row.detail)
      .join(' ');
    expect(plan).toMatch(/SEARCH .* USING (COVERING )?INDEX/i);
    expect(plan).not.toContain('USE TEMP B-TREE');
  }
});

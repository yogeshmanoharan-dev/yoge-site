import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { getPlatformProxy } from 'wrangler';
import { getDb } from '../../src/db/client';
import {
  getProject,
  listContent,
  listProjectUpdates,
  listProjects,
  listResources,
  listSocialLinks,
  listTestimonials,
  latestNowEntry,
} from '../../src/db/queries/public';
import { projects, projectUpdates } from '../../src/db/schema';
import { seedSql } from '../../src/db/seed';

it('reads verified profiles and only published projects and updates from a real local D1', async () => {
  const proxy = await getPlatformProxy<{ DB: D1Database }>({
    configPath: 'wrangler.jsonc',
    persist: false,
    remoteBindings: false,
    envFiles: [],
  });
  try {
    const binding = proxy.env.DB;
    const migration = readFileSync(
      new URL('../../migrations/0000_backend_core.sql', import.meta.url),
      'utf8',
    );
    await binding.batch(
      migration.split('--> statement-breakpoint').map((s) => binding.prepare(s.trim())),
    );
    // The local seed deliberately includes blank unpublished profiles.
    const seed = seedSql('local');
    await binding.batch(
      seed
        .trimEnd()
        .split(/;\n(?=INSERT)/)
        .map((s) => binding.prepare(s)),
    );
    const db = getDb(binding);
    expect((await listSocialLinks(db)).map((s) => s.platform)).toEqual(['github', 'linkedin']);
    expect(await listContent(db)).toEqual([]);
    expect(await listResources(db)).toEqual([]);
    expect(await listTestimonials(db)).toEqual([]);
    expect(await latestNowEntry(db)).toBeUndefined();

    const base = { title: 'Test fixture', tagline: 'Test only', summary: 'Integration test' };
    const draft = crypto.randomUUID(),
      live = crypto.randomUUID();
    await db.insert(projects).values([
      { ...base, id: draft, slug: 'draft' },
      { ...base, id: live, slug: 'visible', isPublished: true, status: 'prototype' },
    ]);
    await db.insert(projectUpdates).values([
      { projectId: draft, title: 'Hidden parent', bodyMd: 'Test body', isPublished: true },
      { projectId: live, title: 'Published update', bodyMd: 'Test body', isPublished: true },
      { projectId: live, title: 'Draft update', bodyMd: 'Test body' },
    ]);
    expect(await listProjects(db, 'idea')).toEqual([]);
    expect((await listProjects(db, 'prototype')).map((p) => p.id)).toEqual([live]);
    expect(await getProject(db, 'draft')).toBeUndefined();
    expect(await listProjectUpdates(db, draft)).toEqual([]);
    expect((await listProjectUpdates(db, live)).map((p) => p.title)).toEqual(['Published update']);
  } finally {
    await proxy.dispose();
  }
}, 30_000);

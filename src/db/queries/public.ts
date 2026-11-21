import { and, asc, desc, eq } from 'drizzle-orm';
import type { SiteDatabase } from '../client';
import {
  contentItems,
  nowEntries,
  projects,
  projectUpdates,
  resources,
  siteSettings,
  socialLinks,
  testimonials,
} from '../schema';

export function getSetting(db: SiteDatabase, key: string) {
  return db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .get();
}

export function listSocialLinks(db: SiteDatabase) {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.isPublished, true))
    .orderBy(asc(socialLinks.sortOrder), asc(socialLinks.id))
    .all();
}

export function listProjects(db: SiteDatabase, status?: typeof projects.$inferSelect.status) {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.isPublished, true), status ? eq(projects.status, status) : undefined))
    .orderBy(asc(projects.sortOrder), asc(projects.id))
    .all();
}

export function getProject(db: SiteDatabase, slug: string) {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.isPublished, true)))
    .get();
}

export function listProjectUpdates(db: SiteDatabase, projectId: string) {
  return db
    .select({
      id: projectUpdates.id,
      title: projectUpdates.title,
      bodyMd: projectUpdates.bodyMd,
      createdAt: projectUpdates.createdAt,
    })
    .from(projectUpdates)
    .innerJoin(projects, eq(projects.id, projectUpdates.projectId))
    .where(
      and(
        eq(projects.isPublished, true),
        eq(projectUpdates.projectId, projectId),
        eq(projectUpdates.isPublished, true),
      ),
    )
    .orderBy(desc(projectUpdates.createdAt), desc(projectUpdates.id))
    .all();
}

export function listContent(db: SiteDatabase) {
  return db
    .select()
    .from(contentItems)
    .where(eq(contentItems.isPublished, true))
    .orderBy(asc(contentItems.sortOrder), asc(contentItems.id))
    .all();
}

export function listResources(db: SiteDatabase) {
  return db
    .select()
    .from(resources)
    .where(eq(resources.isPublished, true))
    .orderBy(asc(resources.sortOrder), asc(resources.id))
    .all();
}

export function latestNowEntry(db: SiteDatabase) {
  return db
    .select()
    .from(nowEntries)
    .where(eq(nowEntries.isPublished, true))
    .orderBy(desc(nowEntries.month), desc(nowEntries.id))
    .limit(1)
    .get();
}

export function listTestimonials(db: SiteDatabase) {
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isPublished, true))
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id))
    .all();
}

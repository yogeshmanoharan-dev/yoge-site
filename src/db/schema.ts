import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const platforms = [
  'youtube',
  'instagram',
  'linkedin',
  'x',
  'github',
  'facebook',
  'threads',
  'medium',
  'reddit',
  'discord',
  'fiverr',
  'upwork',
  'email',
  'website',
  'other',
] as const;
const projectStatuses = [
  'idea',
  'researching',
  'in_development',
  'prototype',
  'live',
  'paused',
] as const;
const contentTypes = ['video', 'short', 'article_external', 'post', 'podcast'] as const;
const utcNow = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;
const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => text('created_at').notNull().default(utcNow);
const updatedAt = () => text('updated_at').notNull().default(utcNow);
const published = () => integer('is_published', { mode: 'boolean' }).notNull().default(false);
const sortOrder = () => integer('sort_order').notNull().default(0);
const featured = () => integer('is_featured', { mode: 'boolean' }).notNull().default(false);
// The values here are fixed schema constants. SQLite needs a CHECK as well as a TS enum.
const enumList = (values: readonly string[]) =>
  sql.raw(values.map((value) => "'" + value + "'").join(','));

export const siteSettings = sqliteTable(
  'site_settings',
  {
    key: text('key').primaryKey(),
    value: text('value', { mode: 'json' }).$type<unknown>().notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [check('settings_json', sql`json_valid(${t.value})`)],
);

export const socialLinks = sqliteTable(
  'social_links',
  {
    id: id(),
    platform: text('platform', { enum: platforms }).notNull().unique(),
    label: text('label').notNull(),
    handle: text('handle'),
    url: text('url').notNull().default(''),
    isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
    isPublished: published(),
    sortOrder: sortOrder(),
    showOnLinksPage: integer('show_on_links_page', { mode: 'boolean' }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('social_platform', sql`${t.platform} IN (${enumList(platforms)})`),
    check(
      'social_published_url',
      sql`${t.isPublished} = 0 OR (${t.isPublished} = 1 AND ${t.url} LIKE 'https://_%')`,
    ),
    index('social_public_order_idx').on(t.isPublished, t.sortOrder, t.id),
  ],
);

export const projects = sqliteTable(
  'projects',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    tagline: text('tagline').notNull(),
    summary: text('summary').notNull(),
    problem: text('problem'),
    approach: text('approach'),
    status: text('status', { enum: projectStatuses }).notNull().default('idea'),
    stack: text('stack', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    aiAssistanceNote: text('ai_assistance_note'),
    repoUrl: text('repo_url'),
    demoUrl: text('demo_url'),
    coverImage: text('cover_image'),
    isFeatured: featured(),
    isPublished: published(),
    sortOrder: sortOrder(),
    startedAt: text('started_at'),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('project_status', sql`${t.status} IN (${enumList(projectStatuses)})`),
    check('project_stack_array', sql`json_type(${t.stack}) = 'array'`),
    index('projects_public_order_idx').on(t.isPublished, t.sortOrder, t.id),
    index('projects_status_order_idx').on(t.isPublished, t.status, t.sortOrder, t.id),
  ],
);

export const projectUpdates = sqliteTable(
  'project_updates',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    bodyMd: text('body_md').notNull(),
    createdAt: createdAt(),
    isPublished: published(),
    sortOrder: sortOrder(),
  },
  (t) => [
    index('project_updates_parent_date_idx').on(t.projectId, t.isPublished, t.createdAt, t.id),
  ],
);

export const contentItems = sqliteTable(
  'content_items',
  {
    id: id(),
    type: text('type', { enum: contentTypes }).notNull(),
    platform: text('platform').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    publishedAt: text('published_at'),
    isFeatured: featured(),
    isPublished: published(),
    sortOrder: sortOrder(),
  },
  (t) => [
    check('content_type', sql`${t.type} IN (${enumList(contentTypes)})`),
    index('content_public_order_idx').on(t.isPublished, t.sortOrder, t.id),
  ],
);

export const resources = sqliteTable(
  'resources',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    audience: text('audience'),
    whatInside: text('what_inside', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    format: text('format').notNull(),
    filePath: text('file_path').notNull(),
    fileSizeBytes: integer('file_size_bytes').notNull(),
    version: text('version').notNull(),
    previewImage: text('preview_image'),
    relatedUrl: text('related_url'),
    isPublished: published(),
    sortOrder: sortOrder(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('resource_size', sql`${t.fileSizeBytes} >= 0`),
    check('resource_contents_array', sql`json_type(${t.whatInside}) = 'array'`),
    index('resources_public_order_idx').on(t.isPublished, t.sortOrder, t.id),
  ],
);

export const nowEntries = sqliteTable(
  'now_entries',
  {
    id: id(),
    month: text('month').notNull(),
    bodyMd: text('body_md').notNull(),
    isPublished: published(),
    sortOrder: sortOrder(),
    createdAt: createdAt(),
  },
  (t) => [index('now_public_month_idx').on(t.isPublished, t.month, t.id)],
);

export const testimonials = sqliteTable(
  'testimonials',
  {
    id: id(),
    quote: text('quote').notNull(),
    authorName: text('author_name').notNull(),
    authorContext: text('author_context'),
    sourcePlatform: text('source_platform', { enum: ['fiverr', 'upwork', 'other'] }).notNull(),
    sourceUrl: text('source_url'),
    permissionConfirmed: integer('permission_confirmed', { mode: 'boolean' })
      .notNull()
      .default(false),
    isPublished: published(),
    sortOrder: sortOrder(),
  },
  (t) => [
    check('testimonial_source', sql`${t.sourcePlatform} IN ('fiverr','upwork','other')`),
    check(
      'testimonial_publication',
      sql`${t.isPublished} = 0 OR (${t.isPublished} = 1 AND ${t.permissionConfirmed} = 1 AND ${t.sourceUrl} IS NOT NULL AND ${t.sourceUrl} LIKE 'https://_%')`,
    ),
    index('testimonials_public_order_idx').on(t.isPublished, t.sortOrder, t.id),
  ],
);

export const messages = sqliteTable(
  'messages',
  {
    id: id(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    status: text('status', { enum: ['new', 'read', 'archived'] })
      .notNull()
      .default('new'),
    createdAt: createdAt(),
  },
  (t) => [
    check('message_status', sql`${t.status} IN ('new','read','archived')`),
    index('messages_created_idx').on(t.createdAt),
    index('messages_status_created_idx').on(t.status, t.createdAt),
  ],
);

export const subscribers = sqliteTable(
  'subscribers',
  {
    id: id(),
    email: text('email').notNull().unique(),
    status: text('status', { enum: ['pending', 'subscribed', 'unsubscribed'] })
      .notNull()
      .default('pending'),
    consentText: text('consent_text').notNull(),
    source: text('source').notNull(),
    confirmTokenHash: text('confirm_token_hash').unique(),
    confirmExpiresAt: text('confirm_expires_at'),
    unsubscribeTokenHash: text('unsubscribe_token_hash').unique(),
    createdAt: createdAt(),
    confirmedAt: text('confirmed_at'),
  },
  (t) => [
    check('subscriber_status', sql`${t.status} IN ('pending','subscribed','unsubscribed')`),
    check('subscriber_normalized_email', sql`${t.email} = lower(trim(${t.email}))`),
    index('subscribers_status_created_idx').on(t.status, t.createdAt),
  ],
);

export const eventsDaily = sqliteTable(
  'events_daily',
  {
    day: text('day').notNull(),
    event: text('event', {
      enum: ['resource_download', 'outbound_social', 'outbound_content'],
    }).notNull(),
    ref: text('ref').notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.day, t.event, t.ref] }),
    check(
      'event_name',
      sql`${t.event} IN ('resource_download','outbound_social','outbound_content')`,
    ),
  ],
);

export const adminSessions = sqliteTable(
  'admin_sessions',
  {
    idHash: text('id_hash').primaryKey(),
    githubUserId: text('github_user_id').notNull(),
    createdAt: createdAt(),
    expiresAt: text('expires_at').notNull(),
    lastSeenAt: text('last_seen_at').notNull(),
    userAgentHash: text('user_agent_hash').notNull(),
  },
  (t) => [index('sessions_expiry_idx').on(t.expiresAt)],
);

export const rateLimits = sqliteTable(
  'rate_limits',
  {
    key: text('key').primaryKey(),
    count: integer('count').notNull(),
    windowStart: text('window_start').notNull(),
    expiresAt: text('expires_at').notNull(),
  },
  (t) => [index('limits_expiry_idx').on(t.expiresAt)],
);

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    at: text('at').notNull().default(utcNow),
    actor: text('actor').notNull(),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    diffJson: text('diff_json', { mode: 'json' }).notNull(),
  },
  (t) => [
    check('audit_diff_json', sql`json_valid(${t.diffJson})`),
    index('audit_time_idx').on(t.at),
  ],
);

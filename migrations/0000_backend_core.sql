CREATE TABLE `admin_sessions` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`github_user_id` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`expires_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`user_agent_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_expiry_idx` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`diff_json` text NOT NULL,
	CONSTRAINT "audit_diff_json" CHECK(json_valid("audit_log"."diff_json"))
);
--> statement-breakpoint
CREATE INDEX `audit_time_idx` ON `audit_log` (`at`);--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`platform` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`published_at` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "content_type" CHECK("content_items"."type" IN ('video','short','article_external','post','podcast'))
);
--> statement-breakpoint
CREATE INDEX `content_public_order_idx` ON `content_items` (`is_published`,`sort_order`,`id`);--> statement-breakpoint
CREATE TABLE `events_daily` (
	`day` text NOT NULL,
	`event` text NOT NULL,
	`ref` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `event`, `ref`),
	CONSTRAINT "event_name" CHECK("events_daily"."event" IN ('resource_download','outbound_social','outbound_content'))
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	CONSTRAINT "message_status" CHECK("messages"."status" IN ('new','read','archived'))
);
--> statement-breakpoint
CREATE INDEX `messages_created_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messages_status_created_idx` ON `messages` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `now_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`body_md` text NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `now_public_month_idx` ON `now_entries` (`is_published`,`month`,`id`);--> statement-breakpoint
CREATE TABLE `project_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`body_md` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_updates_parent_date_idx` ON `project_updates` (`project_id`,`is_published`,`created_at`,`id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`tagline` text NOT NULL,
	`summary` text NOT NULL,
	`problem` text,
	`approach` text,
	`status` text DEFAULT 'idea' NOT NULL,
	`stack` text DEFAULT '[]' NOT NULL,
	`ai_assistance_note` text,
	`repo_url` text,
	`demo_url` text,
	`cover_image` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`started_at` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	CONSTRAINT "project_status" CHECK("projects"."status" IN ('idea','researching','in_development','prototype','live','paused')),
	CONSTRAINT "project_stack_array" CHECK(json_type("projects"."stack") = 'array')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `projects_public_order_idx` ON `projects` (`is_published`,`sort_order`,`id`);--> statement-breakpoint
CREATE INDEX `projects_status_order_idx` ON `projects` (`is_published`,`status`,`sort_order`,`id`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`window_start` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `limits_expiry_idx` ON `rate_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`audience` text,
	`what_inside` text DEFAULT '[]' NOT NULL,
	`format` text NOT NULL,
	`file_path` text NOT NULL,
	`file_size_bytes` integer NOT NULL,
	`version` text NOT NULL,
	`preview_image` text,
	`related_url` text,
	`is_published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	CONSTRAINT "resource_size" CHECK("resources"."file_size_bytes" >= 0),
	CONSTRAINT "resource_contents_array" CHECK(json_type("resources"."what_inside") = 'array')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resources_slug_unique` ON `resources` (`slug`);--> statement-breakpoint
CREATE INDEX `resources_public_order_idx` ON `resources` (`is_published`,`sort_order`,`id`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	CONSTRAINT "settings_json" CHECK(json_valid("site_settings"."value"))
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`label` text NOT NULL,
	`handle` text,
	`url` text DEFAULT '' NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`show_on_links_page` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	CONSTRAINT "social_platform" CHECK("social_links"."platform" IN ('youtube','instagram','linkedin','x','github','facebook','threads','medium','reddit','discord','fiverr','upwork','email','website','other')),
	CONSTRAINT "social_published_url" CHECK("social_links"."is_published" = 0 OR ("social_links"."is_published" = 1 AND "social_links"."url" LIKE 'https://_%'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `social_links_platform_unique` ON `social_links` (`platform`);--> statement-breakpoint
CREATE INDEX `social_public_order_idx` ON `social_links` (`is_published`,`sort_order`,`id`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`consent_text` text NOT NULL,
	`source` text NOT NULL,
	`confirm_token_hash` text,
	`confirm_expires_at` text,
	`unsubscribe_token_hash` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`confirmed_at` text,
	CONSTRAINT "subscriber_status" CHECK("subscribers"."status" IN ('pending','subscribed','unsubscribed')),
	CONSTRAINT "subscriber_normalized_email" CHECK("subscribers"."email" = lower(trim("subscribers"."email")))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_confirm_token_hash_unique` ON `subscribers` (`confirm_token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_unsubscribe_token_hash_unique` ON `subscribers` (`unsubscribe_token_hash`);--> statement-breakpoint
CREATE INDEX `subscribers_status_created_idx` ON `subscribers` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`quote` text NOT NULL,
	`author_name` text NOT NULL,
	`author_context` text,
	`source_platform` text NOT NULL,
	`source_url` text,
	`permission_confirmed` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "testimonial_source" CHECK("testimonials"."source_platform" IN ('fiverr','upwork','other')),
	CONSTRAINT "testimonial_publication" CHECK("testimonials"."is_published" = 0 OR ("testimonials"."is_published" = 1 AND "testimonials"."permission_confirmed" = 1 AND "testimonials"."source_url" IS NOT NULL AND "testimonials"."source_url" LIKE 'https://_%'))
);
--> statement-breakpoint
CREATE INDEX `testimonials_public_order_idx` ON `testimonials` (`is_published`,`sort_order`,`id`);
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`services_categories\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_categories_order_idx\` ON \`services_categories\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`services_categories_parent_idx\` ON \`services_categories\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`tone\` text DEFAULT 'info' NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_tags_order_idx\` ON \`services_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_tags_parent_id_idx\` ON \`services_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_detail_overview_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_detail_overview_paragraphs_order_idx\` ON \`services_detail_overview_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_detail_overview_paragraphs_parent_id_idx\` ON \`services_detail_overview_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_detail_procedures\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`detail\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_detail_procedures_order_idx\` ON \`services_detail_procedures\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_detail_procedures_parent_id_idx\` ON \`services_detail_procedures\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_detail_preparation\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_detail_preparation_order_idx\` ON \`services_detail_preparation\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_detail_preparation_parent_id_idx\` ON \`services_detail_preparation\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_detail_schedule\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_detail_schedule_order_idx\` ON \`services_detail_schedule\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_detail_schedule_parent_id_idx\` ON \`services_detail_schedule\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_detail_staff\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text NOT NULL,
  	\`initials\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_detail_staff_order_idx\` ON \`services_detail_staff\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_detail_staff_parent_id_idx\` ON \`services_detail_staff\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`emergency\` integer,
  	\`summary\` text NOT NULL,
  	\`summary_short\` text NOT NULL,
  	\`image_id\` integer,
  	\`category_label\` text NOT NULL,
  	\`in_mega_menu\` integer,
  	\`menu_name\` text,
  	\`menu_summary\` text,
  	\`home_featured\` integer,
  	\`home_title\` text,
  	\`home_summary\` text,
  	\`home_summary_short\` text,
  	\`home_sort\` numeric DEFAULT 1,
  	\`detail_lead\` text NOT NULL,
  	\`detail_cta_label\` text,
  	\`detail_emergency_title\` text,
  	\`detail_secondary_cta_label\` text,
  	\`detail_secondary_cta_href\` text,
  	\`detail_overview_heading\` text,
  	\`slug\` text NOT NULL,
  	\`sort\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`services_image_idx\` ON \`services\` (\`image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`services_slug_idx\` ON \`services\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`services_updated_at_idx\` ON \`services\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`services_created_at_idx\` ON \`services\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`services_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_rels_order_idx\` ON \`services_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`services_rels_parent_idx\` ON \`services_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`services_rels_path_idx\` ON \`services_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`services_rels_media_id_idx\` ON \`services_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`news_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`excerpt\` text,
  	\`excerpt_short\` text,
  	\`cover_id\` integer,
  	\`cover_caption\` text,
  	\`body\` text,
  	\`sidebar_cta_title\` text,
  	\`sidebar_cta_text\` text,
  	\`sidebar_cta_label\` text,
  	\`sidebar_cta_href\` text,
  	\`slug\` text,
  	\`published_at\` text,
  	\`category\` text,
  	\`icon\` text DEFAULT 'campaign',
  	\`featured\` integer,
  	\`author\` text,
  	\`related_service_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`related_service_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`news_posts_cover_idx\` ON \`news_posts\` (\`cover_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`news_posts_slug_idx\` ON \`news_posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`news_posts_related_service_idx\` ON \`news_posts\` (\`related_service_id\`);`)
  await db.run(sql`CREATE INDEX \`news_posts_updated_at_idx\` ON \`news_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`news_posts_created_at_idx\` ON \`news_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`news_posts__status_idx\` ON \`news_posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_news_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_excerpt\` text,
  	\`version_excerpt_short\` text,
  	\`version_cover_id\` integer,
  	\`version_cover_caption\` text,
  	\`version_body\` text,
  	\`version_sidebar_cta_title\` text,
  	\`version_sidebar_cta_text\` text,
  	\`version_sidebar_cta_label\` text,
  	\`version_sidebar_cta_href\` text,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_category\` text,
  	\`version_icon\` text DEFAULT 'campaign',
  	\`version_featured\` integer,
  	\`version_author\` text,
  	\`version_related_service_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news_posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_related_service_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_news_posts_v_parent_idx\` ON \`_news_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_version_version_cover_idx\` ON \`_news_posts_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_version_version_slug_idx\` ON \`_news_posts_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_version_version_related_service_idx\` ON \`_news_posts_v\` (\`version_related_service_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_version_version_updated_at_idx\` ON \`_news_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_version_version_created_at_idx\` ON \`_news_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_version_version__status_idx\` ON \`_news_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_created_at_idx\` ON \`_news_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_updated_at_idx\` ON \`_news_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_posts_v_latest_idx\` ON \`_news_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`excerpt\` text,
  	\`cover_id\` integer,
  	\`body\` text,
  	\`slug\` text,
  	\`published_at\` text,
  	\`category\` text,
  	\`author\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_cover_idx\` ON \`articles\` (\`cover_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`articles__status_idx\` ON \`articles\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_excerpt\` text,
  	\`version_cover_id\` integer,
  	\`version_body\` text,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_category\` text,
  	\`version_author\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_parent_idx\` ON \`_articles_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_cover_idx\` ON \`_articles_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_slug_idx\` ON \`_articles_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_updated_at_idx\` ON \`_articles_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_created_at_idx\` ON \`_articles_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version__status_idx\` ON \`_articles_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_created_at_idx\` ON \`_articles_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_updated_at_idx\` ON \`_articles_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_latest_idx\` ON \`_articles_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`doctors_days\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`doctors\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`doctors_days_order_idx\` ON \`doctors_days\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`doctors_days_parent_idx\` ON \`doctors_days\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`doctors\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`initials\` text NOT NULL,
  	\`photo_id\` integer,
  	\`specialty\` text NOT NULL,
  	\`group\` text NOT NULL,
  	\`service_id\` integer,
  	\`hours\` text NOT NULL,
  	\`active\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`sort\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`doctors_photo_idx\` ON \`doctors\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`doctors_service_idx\` ON \`doctors\` (\`service_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`doctors_slug_idx\` ON \`doctors\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`doctors_updated_at_idx\` ON \`doctors\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`doctors_created_at_idx\` ON \`doctors\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`staff_members\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`initials\` text NOT NULL,
  	\`photo_id\` integer,
  	\`title\` text NOT NULL,
  	\`group\` text NOT NULL,
  	\`section\` text,
  	\`icon\` text,
  	\`bio\` text,
  	\`sort\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`staff_members_photo_idx\` ON \`staff_members\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`staff_members_updated_at_idx\` ON \`staff_members\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`staff_members_created_at_idx\` ON \`staff_members\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`job_postings_duties\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`job_postings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`job_postings_duties_order_idx\` ON \`job_postings_duties\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`job_postings_duties_parent_id_idx\` ON \`job_postings_duties\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`job_postings_requirements\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`job_postings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`job_postings_requirements_order_idx\` ON \`job_postings_requirements\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`job_postings_requirements_parent_id_idx\` ON \`job_postings_requirements\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`job_postings_process\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`job_postings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`job_postings_process_order_idx\` ON \`job_postings_process\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`job_postings_process_parent_id_idx\` ON \`job_postings_process\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`job_postings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`department\` text,
  	\`icon\` text,
  	\`employment_type\` text DEFAULT 'Full-time',
  	\`shift\` text,
  	\`openings\` numeric,
  	\`location\` text DEFAULT 'Sibonga, Cebu',
  	\`licensed\` integer,
  	\`role\` text,
  	\`compensation\` text,
  	\`slug\` text,
  	\`closes_at\` text,
  	\`sort\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`job_postings_slug_idx\` ON \`job_postings\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`job_postings_updated_at_idx\` ON \`job_postings\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`job_postings_created_at_idx\` ON \`job_postings\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`job_postings__status_idx\` ON \`job_postings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_job_postings_v_version_duties\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_job_postings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_duties_order_idx\` ON \`_job_postings_v_version_duties\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_duties_parent_id_idx\` ON \`_job_postings_v_version_duties\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_job_postings_v_version_requirements\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_job_postings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_requirements_order_idx\` ON \`_job_postings_v_version_requirements\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_requirements_parent_id_idx\` ON \`_job_postings_v_version_requirements\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_job_postings_v_version_process\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_job_postings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_process_order_idx\` ON \`_job_postings_v_version_process\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_process_parent_id_idx\` ON \`_job_postings_v_version_process\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_job_postings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_department\` text,
  	\`version_icon\` text,
  	\`version_employment_type\` text DEFAULT 'Full-time',
  	\`version_shift\` text,
  	\`version_openings\` numeric,
  	\`version_location\` text DEFAULT 'Sibonga, Cebu',
  	\`version_licensed\` integer,
  	\`version_role\` text,
  	\`version_compensation\` text,
  	\`version_slug\` text,
  	\`version_closes_at\` text,
  	\`version_sort\` numeric DEFAULT 100,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`job_postings\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_job_postings_v_parent_idx\` ON \`_job_postings_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_version_slug_idx\` ON \`_job_postings_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_version_updated_at_idx\` ON \`_job_postings_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_version_created_at_idx\` ON \`_job_postings_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_version_version__status_idx\` ON \`_job_postings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_created_at_idx\` ON \`_job_postings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_updated_at_idx\` ON \`_job_postings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_job_postings_v_latest_idx\` ON \`_job_postings_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`faqs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	\`sort\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`faqs_updated_at_idx\` ON \`faqs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`faqs_created_at_idx\` ON \`faqs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`contact_submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`mobile\` text NOT NULL,
  	\`email\` text,
  	\`subject\` text NOT NULL,
  	\`message\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`notes\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_submissions_updated_at_idx\` ON \`contact_submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`contact_submissions_created_at_idx\` ON \`contact_submissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`job_applications\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`job_id\` integer NOT NULL,
  	\`name\` text NOT NULL,
  	\`contact\` text NOT NULL,
  	\`prc_licence\` text,
  	\`cv_id\` integer NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`notes\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`job_id\`) REFERENCES \`job_postings\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cv_id\`) REFERENCES \`applicant_files\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`job_applications_job_idx\` ON \`job_applications\` (\`job_id\`);`)
  await db.run(sql`CREATE INDEX \`job_applications_cv_idx\` ON \`job_applications\` (\`cv_id\`);`)
  await db.run(sql`CREATE INDEX \`job_applications_updated_at_idx\` ON \`job_applications\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`job_applications_created_at_idx\` ON \`job_applications\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`applicant_files\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`applicant_files_updated_at_idx\` ON \`applicant_files\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`applicant_files_created_at_idx\` ON \`applicant_files\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`applicant_files_filename_idx\` ON \`applicant_files\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`services_id\` integer,
  	\`news_posts_id\` integer,
  	\`articles_id\` integer,
  	\`doctors_id\` integer,
  	\`staff_members_id\` integer,
  	\`job_postings_id\` integer,
  	\`faqs_id\` integer,
  	\`contact_submissions_id\` integer,
  	\`job_applications_id\` integer,
  	\`applicant_files_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_posts_id\`) REFERENCES \`news_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`articles_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`doctors_id\`) REFERENCES \`doctors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`staff_members_id\`) REFERENCES \`staff_members\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`job_postings_id\`) REFERENCES \`job_postings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faqs_id\`) REFERENCES \`faqs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`job_applications_id\`) REFERENCES \`job_applications\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`applicant_files_id\`) REFERENCES \`applicant_files\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`news_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`articles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_doctors_id_idx\` ON \`payload_locked_documents_rels\` (\`doctors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_staff_members_id_idx\` ON \`payload_locked_documents_rels\` (\`staff_members_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_job_postings_id_idx\` ON \`payload_locked_documents_rels\` (\`job_postings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faqs_id_idx\` ON \`payload_locked_documents_rels\` (\`faqs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_job_applications_id_idx\` ON \`payload_locked_documents_rels\` (\`job_applications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_applicant_files_id_idx\` ON \`payload_locked_documents_rels\` (\`applicant_files_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`about_page_story_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_order_idx\` ON \`about_page_story_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_parent_id_idx\` ON \`about_page_story_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_milestones\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`year\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_milestones_order_idx\` ON \`about_page_milestones\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_milestones_parent_id_idx\` ON \`about_page_milestones\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_facts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_facts_order_idx\` ON \`about_page_facts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_facts_parent_id_idx\` ON \`about_page_facts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_team_counts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`count\` numeric NOT NULL,
  	\`role\` text NOT NULL,
  	\`note\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_team_counts_order_idx\` ON \`about_page_team_counts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_team_counts_parent_id_idx\` ON \`about_page_team_counts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`lead\` text NOT NULL,
  	\`story_eyebrow\` text NOT NULL,
  	\`story_heading\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`about_page_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_rels_order_idx\` ON \`about_page_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_rels_parent_idx\` ON \`about_page_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_rels_path_idx\` ON \`about_page_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_rels_media_id_idx\` ON \`about_page_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`vision_page_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vision_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`vision_page_values_order_idx\` ON \`vision_page_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`vision_page_values_parent_id_idx\` ON \`vision_page_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`vision_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`lead\` text NOT NULL,
  	\`vision\` text NOT NULL,
  	\`mission\` text NOT NULL,
  	\`rights_note\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`patients_page_checklists_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`patients_page_checklists\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`patients_page_checklists_items_order_idx\` ON \`patients_page_checklists_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`patients_page_checklists_items_parent_id_idx\` ON \`patients_page_checklists_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`patients_page_checklists\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`patients_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`patients_page_checklists_order_idx\` ON \`patients_page_checklists\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`patients_page_checklists_parent_id_idx\` ON \`patients_page_checklists\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`patients_page_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`patients_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`patients_page_steps_order_idx\` ON \`patients_page_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`patients_page_steps_parent_id_idx\` ON \`patients_page_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`patients_page_billing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`patients_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`patients_page_billing_order_idx\` ON \`patients_page_billing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`patients_page_billing_parent_id_idx\` ON \`patients_page_billing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`patients_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`lead\` text NOT NULL,
  	\`bring_intro\` text NOT NULL,
  	\`steps_intro\` text NOT NULL,
  	\`billing_note\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`careers_page_benefits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`careers_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`careers_page_benefits_order_idx\` ON \`careers_page_benefits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`careers_page_benefits_parent_id_idx\` ON \`careers_page_benefits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`careers_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`site_settings_visiting_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`area\` text NOT NULL,
  	\`hours\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_visiting_hours_order_idx\` ON \`site_settings_visiting_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_visiting_hours_parent_id_idx\` ON \`site_settings_visiting_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hospital_name\` text NOT NULL,
  	\`short_name\` text NOT NULL,
  	\`tagline\` text NOT NULL,
  	\`summary\` text NOT NULL,
  	\`address_street\` text NOT NULL,
  	\`address_barangay\` text NOT NULL,
  	\`address_town\` text NOT NULL,
  	\`address_postcode\` text NOT NULL,
  	\`address_province\` text NOT NULL,
  	\`map_url\` text NOT NULL,
  	\`emergency_number\` text NOT NULL,
  	\`trunkline\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`careers_email\` text NOT NULL,
  	\`social_facebook\` text,
  	\`social_messenger\` text,
  	\`outpatient_hours\` text NOT NULL,
  	\`visiting_rules\` text NOT NULL,
  	\`accreditation_philhealth_number\` text,
  	\`accreditation_doh_licence_level\` text NOT NULL,
  	\`footer_text\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`homepage_settings_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`label_short\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_settings_stats_order_idx\` ON \`homepage_settings_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_stats_parent_id_idx\` ON \`homepage_settings_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_stats\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`services_categories\`;`)
  await db.run(sql`DROP TABLE \`services_tags\`;`)
  await db.run(sql`DROP TABLE \`services_detail_overview_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`services_detail_procedures\`;`)
  await db.run(sql`DROP TABLE \`services_detail_preparation\`;`)
  await db.run(sql`DROP TABLE \`services_detail_schedule\`;`)
  await db.run(sql`DROP TABLE \`services_detail_staff\`;`)
  await db.run(sql`DROP TABLE \`services\`;`)
  await db.run(sql`DROP TABLE \`services_rels\`;`)
  await db.run(sql`DROP TABLE \`news_posts\`;`)
  await db.run(sql`DROP TABLE \`_news_posts_v\`;`)
  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`DROP TABLE \`_articles_v\`;`)
  await db.run(sql`DROP TABLE \`doctors_days\`;`)
  await db.run(sql`DROP TABLE \`doctors\`;`)
  await db.run(sql`DROP TABLE \`staff_members\`;`)
  await db.run(sql`DROP TABLE \`job_postings_duties\`;`)
  await db.run(sql`DROP TABLE \`job_postings_requirements\`;`)
  await db.run(sql`DROP TABLE \`job_postings_process\`;`)
  await db.run(sql`DROP TABLE \`job_postings\`;`)
  await db.run(sql`DROP TABLE \`_job_postings_v_version_duties\`;`)
  await db.run(sql`DROP TABLE \`_job_postings_v_version_requirements\`;`)
  await db.run(sql`DROP TABLE \`_job_postings_v_version_process\`;`)
  await db.run(sql`DROP TABLE \`_job_postings_v\`;`)
  await db.run(sql`DROP TABLE \`faqs\`;`)
  await db.run(sql`DROP TABLE \`contact_submissions\`;`)
  await db.run(sql`DROP TABLE \`job_applications\`;`)
  await db.run(sql`DROP TABLE \`applicant_files\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`about_page_story_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_milestones\`;`)
  await db.run(sql`DROP TABLE \`about_page_facts\`;`)
  await db.run(sql`DROP TABLE \`about_page_team_counts\`;`)
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`about_page_rels\`;`)
  await db.run(sql`DROP TABLE \`vision_page_values\`;`)
  await db.run(sql`DROP TABLE \`vision_page\`;`)
  await db.run(sql`DROP TABLE \`patients_page_checklists_items\`;`)
  await db.run(sql`DROP TABLE \`patients_page_checklists\`;`)
  await db.run(sql`DROP TABLE \`patients_page_steps\`;`)
  await db.run(sql`DROP TABLE \`patients_page_billing\`;`)
  await db.run(sql`DROP TABLE \`patients_page\`;`)
  await db.run(sql`DROP TABLE \`careers_page_benefits\`;`)
  await db.run(sql`DROP TABLE \`careers_page\`;`)
  await db.run(sql`DROP TABLE \`site_settings_visiting_hours\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`homepage_settings_stats\`;`)
  await db.run(sql`DROP TABLE \`homepage_settings\`;`)
}

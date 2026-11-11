import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`audit_log\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`summary\` text NOT NULL,
  	\`action\` text NOT NULL,
  	\`section\` text,
  	\`document_title\` text,
  	\`document_id\` text,
  	\`changes\` text,
  	\`user_id\` integer,
  	\`user_name\` text,
  	\`user_email\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`audit_log_action_idx\` ON \`audit_log\` (\`action\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_document_id_idx\` ON \`audit_log\` (\`document_id\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_user_idx\` ON \`audit_log\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_updated_at_idx\` ON \`audit_log\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`audit_log_created_at_idx\` ON \`audit_log\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`audit_log_id\` integer REFERENCES audit_log(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_audit_log_id_idx\` ON \`payload_locked_documents_rels\` (\`audit_log_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`audit_log\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
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
  	\`booking_requests_id\` integer,
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
  	FOREIGN KEY (\`booking_requests_id\`) REFERENCES \`booking_requests\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`job_applications_id\`) REFERENCES \`job_applications\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`applicant_files_id\`) REFERENCES \`applicant_files\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "services_id", "news_posts_id", "articles_id", "doctors_id", "staff_members_id", "job_postings_id", "faqs_id", "contact_submissions_id", "booking_requests_id", "job_applications_id", "applicant_files_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "services_id", "news_posts_id", "articles_id", "doctors_id", "staff_members_id", "job_postings_id", "faqs_id", "contact_submissions_id", "booking_requests_id", "job_applications_id", "applicant_files_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_booking_requests_id_idx\` ON \`payload_locked_documents_rels\` (\`booking_requests_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_job_applications_id_idx\` ON \`payload_locked_documents_rels\` (\`job_applications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_applicant_files_id_idx\` ON \`payload_locked_documents_rels\` (\`applicant_files_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
}

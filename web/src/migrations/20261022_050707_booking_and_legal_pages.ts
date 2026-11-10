import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { doctorBookingTimes, legalPagesData } from '../payload/starterData'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`booking_requests\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`doctor_id\` integer NOT NULL,
  	\`department\` text NOT NULL,
  	\`date\` text NOT NULL,
  	\`time\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`mobile\` text NOT NULL,
  	\`philhealth\` text,
  	\`first_visit\` text NOT NULL,
  	\`reason\` text NOT NULL,
  	\`status\` text DEFAULT 'requested' NOT NULL,
  	\`notes\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`booking_requests_doctor_idx\` ON \`booking_requests\` (\`doctor_id\`);`)
  await db.run(sql`CREATE INDEX \`booking_requests_date_idx\` ON \`booking_requests\` (\`date\`);`)
  await db.run(sql`CREATE INDEX \`booking_requests_updated_at_idx\` ON \`booking_requests\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`booking_requests_created_at_idx\` ON \`booking_requests\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`legal_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`privacy_intro\` text NOT NULL,
  	\`privacy_body\` text NOT NULL,
  	\`privacy_last_updated\` text NOT NULL,
  	\`patient_rights_intro\` text NOT NULL,
  	\`patient_rights_body\` text NOT NULL,
  	\`patient_rights_last_updated\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`doctors\` ADD \`booking_from\` text;`)
  await db.run(sql`ALTER TABLE \`doctors\` ADD \`booking_to\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`booking_requests_id\` integer REFERENCES booking_requests(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_booking_requests_id_idx\` ON \`payload_locked_documents_rels\` (\`booking_requests_id\`);`)

  // ---- Starter content (only fills what is empty; never overwrites edits) ----
  const context = { skipRevalidate: true }
  const legal = await payload.findGlobal({ slug: 'legal-pages', req, depth: 0 })
  if (!legal.privacy?.intro && !legal.patientRights?.intro) {
    await payload.updateGlobal({ slug: 'legal-pages', data: legalPagesData(), req, context })
  }
  // Plain SQL: the doctors collection's fields have changed since (per-day
  // schedules, 2026-11-10), so the Local API no longer matches this schema.
  for (const [slug, times] of doctorBookingTimes) {
    await db.run(sql`UPDATE \`doctors\` SET \`booking_from\` = ${times.from}, \`booking_to\` = ${times.to}
      WHERE \`slug\` = ${slug} AND \`booking_from\` IS NULL AND \`booking_to\` IS NULL;`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`booking_requests\`;`)
  await db.run(sql`DROP TABLE \`legal_pages\`;`)
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
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "services_id", "news_posts_id", "articles_id", "doctors_id", "staff_members_id", "job_postings_id", "faqs_id", "contact_submissions_id", "job_applications_id", "applicant_files_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "services_id", "news_posts_id", "articles_id", "doctors_id", "staff_members_id", "job_postings_id", "faqs_id", "contact_submissions_id", "job_applications_id", "applicant_files_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_job_applications_id_idx\` ON \`payload_locked_documents_rels\` (\`job_applications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_applicant_files_id_idx\` ON \`payload_locked_documents_rels\` (\`applicant_files_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`ALTER TABLE \`doctors\` DROP COLUMN \`booking_from\`;`)
  await db.run(sql`ALTER TABLE \`doctors\` DROP COLUMN \`booking_to\`;`)
}

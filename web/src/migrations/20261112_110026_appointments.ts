import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`doctors_days_off\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to\` text,
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`doctors\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`doctors_days_off_order_idx\` ON \`doctors_days_off\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`doctors_days_off_parent_id_idx\` ON \`doctors_days_off\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_notifications_appointment_recipients\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_appointment_recipients_order_idx\` ON \`site_settings_notifications_appointment_recipients\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_appointment_recipients_parent_id_idx\` ON \`site_settings_notifications_appointment_recipients\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_clinic_closures\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to\` text,
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_clinic_closures_order_idx\` ON \`site_settings_clinic_closures\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_clinic_closures_parent_id_idx\` ON \`site_settings_clinic_closures\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`booking_requests\` ADD \`email\` text;`)
  await db.run(sql`ALTER TABLE \`booking_requests\` ADD \`history\` text;`)
  await db.run(sql`ALTER TABLE \`booking_requests\` ADD \`manage_token\` text;`)
  await db.run(sql`CREATE INDEX \`booking_requests_manage_token_idx\` ON \`booking_requests\` (\`manage_token\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`doctors_days_off\`;`)
  await db.run(sql`DROP TABLE \`site_settings_notifications_appointment_recipients\`;`)
  await db.run(sql`DROP TABLE \`site_settings_clinic_closures\`;`)
  await db.run(sql`DROP INDEX \`booking_requests_manage_token_idx\`;`)
  await db.run(sql`ALTER TABLE \`booking_requests\` DROP COLUMN \`email\`;`)
  await db.run(sql`ALTER TABLE \`booking_requests\` DROP COLUMN \`history\`;`)
  await db.run(sql`ALTER TABLE \`booking_requests\` DROP COLUMN \`manage_token\`;`)
}

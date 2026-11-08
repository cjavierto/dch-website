import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings_notifications_contact_recipients\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_contact_recipients_order_idx\` ON \`site_settings_notifications_contact_recipients\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_contact_recipients_parent_id_idx\` ON \`site_settings_notifications_contact_recipients\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_notifications_application_recipients\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_application_recipients_order_idx\` ON \`site_settings_notifications_application_recipients\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_notifications_application_recipients_parent_id_idx\` ON \`site_settings_notifications_application_recipients\` (\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings_notifications_contact_recipients\`;`)
  await db.run(sql`DROP TABLE \`site_settings_notifications_application_recipients\`;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`homepage_settings_quick_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`detail\` text,
  	\`link\` text DEFAULT 'contact' NOT NULL,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_settings_quick_links_order_idx\` ON \`homepage_settings_quick_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_quick_links_parent_id_idx\` ON \`homepage_settings_quick_links\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`emergency_card_title\` text DEFAULT 'Emergency Room' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`emergency_card_detail\` text DEFAULT 'Open 24 hours · {emergencyNumber}';`)

  // Starter content: the three cards the homepage showed until now (plain SQL,
  // so later field changes can't break this migration).
  const cards = [
    { icon: 'event_available', title: 'Book Appointment', detail: 'Message OPD to request a slot', link: 'book' },
    { icon: 'badge', title: 'Doctors Directory', detail: 'Who is in clinic today', link: 'doctors' },
    { icon: 'assignment', title: 'Patients & Visitors', detail: 'Admission, billing, visiting hours', link: 'patients' },
  ]
  for (const [i, c] of cards.entries()) {
    await db.run(sql`INSERT INTO \`homepage_settings_quick_links\` (\`_order\`, \`_parent_id\`, \`id\`, \`title\`, \`icon\`, \`detail\`, \`link\`)
      SELECT ${i + 1}, \`id\`, lower(hex(randomblob(12))), ${c.title}, ${c.icon}, ${c.detail}, ${c.link} FROM \`homepage_settings\`;`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`homepage_settings_quick_links\`;`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` DROP COLUMN \`emergency_card_title\`;`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` DROP COLUMN \`emergency_card_detail\`;`)
}

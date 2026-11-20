import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`hero_image_position\` text DEFAULT 'center';`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`hero_heading\` text;`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`hero_text\` text;`)
  await db.run(sql`CREATE INDEX \`homepage_settings_hero_hero_image_idx\` ON \`homepage_settings\` (\`hero_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_homepage_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`emergency_card_title\` text DEFAULT 'Emergency Room' NOT NULL,
  	\`emergency_card_detail\` text DEFAULT 'Open 24 hours · {emergencyNumber}',
  	\`show_stats\` integer DEFAULT true,
  	\`facility_photos_large_id\` integer,
  	\`facility_photos_left_id\` integer,
  	\`facility_photos_right_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`facility_photos_large_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`facility_photos_left_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`facility_photos_right_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_homepage_settings\`("id", "emergency_card_title", "emergency_card_detail", "show_stats", "facility_photos_large_id", "facility_photos_left_id", "facility_photos_right_id", "updated_at", "created_at") SELECT "id", "emergency_card_title", "emergency_card_detail", "show_stats", "facility_photos_large_id", "facility_photos_left_id", "facility_photos_right_id", "updated_at", "created_at" FROM \`homepage_settings\`;`)
  await db.run(sql`DROP TABLE \`homepage_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_homepage_settings\` RENAME TO \`homepage_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`homepage_settings_facility_photos_facility_photos_large_idx\` ON \`homepage_settings\` (\`facility_photos_large_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_facility_photos_facility_photos_left_idx\` ON \`homepage_settings\` (\`facility_photos_left_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_facility_photos_facility_photos_right_idx\` ON \`homepage_settings\` (\`facility_photos_right_id\`);`)
}

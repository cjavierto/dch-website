import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`facility_photos_large_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`facility_photos_left_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`homepage_settings\` ADD \`facility_photos_right_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_facility_photos_facility_photos_large_idx\` ON \`homepage_settings\` (\`facility_photos_large_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_facility_photos_facility_photos_left_idx\` ON \`homepage_settings\` (\`facility_photos_left_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_facility_photos_facility_photos_right_idx\` ON \`homepage_settings\` (\`facility_photos_right_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_homepage_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_stats\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_homepage_settings\`("id", "show_stats", "updated_at", "created_at") SELECT "id", "show_stats", "updated_at", "created_at" FROM \`homepage_settings\`;`)
  await db.run(sql`DROP TABLE \`homepage_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_homepage_settings\` RENAME TO \`homepage_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`vision_page\` ADD \`values_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`vision_page\` ADD \`values_heading\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`vision_page\` DROP COLUMN \`values_eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`vision_page\` DROP COLUMN \`values_heading\`;`)
}

import { randomBytes } from 'node:crypto'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { accreditationBadgesData } from '../payload/starterData'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings_accreditation_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`subtitle\` text,
  	\`logo_id\` integer,
  	\`link\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_accreditation_badges_order_idx\` ON \`site_settings_accreditation_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_accreditation_badges_parent_id_idx\` ON \`site_settings_accreditation_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_accreditation_badges_logo_idx\` ON \`site_settings_accreditation_badges\` (\`logo_id\`);`)

  // ---- Starter content: the PhilHealth and DOH badges the footer showed
  // before this list existed. Only when the list is empty; logos stay unset.
  // db.all, not db.get: get throws on an empty result (a fresh database).
  const [settings] = await db.all<{ id: number; level: string }>(
    sql`SELECT id, accreditation_doh_licence_level AS level FROM site_settings LIMIT 1;`,
  )
  if (!settings) return
  const [existing] = await db.all<{ n: number }>(sql`SELECT COUNT(*) AS n FROM site_settings_accreditation_badges;`)
  if (existing?.n) return
  const rows = accreditationBadgesData(settings.level)
  for (const [i, b] of rows.entries()) {
    const id = randomBytes(12).toString('hex')
    await db.run(
      sql`INSERT INTO site_settings_accreditation_badges (_order, _parent_id, id, name, subtitle) VALUES (${i + 1}, ${settings.id}, ${id}, ${b.name}, ${b.subtitle});`,
    )
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings_accreditation_badges\`;`)
}

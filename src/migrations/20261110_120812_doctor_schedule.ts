import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`doctors_schedule\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`day\` text NOT NULL,
  	\`from\` text,
  	\`to\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`doctors\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`doctors_schedule_order_idx\` ON \`doctors_schedule\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`doctors_schedule_parent_id_idx\` ON \`doctors_schedule\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`doctors\` ADD \`schedule_note\` text;`)
  await db.run(sql`ALTER TABLE \`doctors\` ADD \`bookable\` integer DEFAULT false;`)

  // Data: each old clinic day becomes a session with the old booking window
  // (or no times when the doctor had none).
  await db.run(sql`INSERT INTO \`doctors_schedule\` (\`_order\`, \`_parent_id\`, \`id\`, \`day\`, \`from\`, \`to\`)
    SELECT ROW_NUMBER() OVER (PARTITION BY dd.\`parent_id\` ORDER BY CAST(dd.\`value\` AS integer)),
           dd.\`parent_id\`, lower(hex(randomblob(12))), dd.\`value\`, d.\`booking_from\`, d.\`booking_to\`
    FROM \`doctors_days\` dd JOIN \`doctors\` d ON d.\`id\` = dd.\`parent_id\`
    WHERE dd.\`value\` IS NOT NULL;`)
  // Bookable = had a booking window. The old hours text stays as the note
  // unless it only repeated the booking window ("9:00 AM – 12:00 NN").
  await db.run(sql`UPDATE \`doctors\` SET
    \`bookable\` = (\`booking_from\` IS NOT NULL AND \`booking_to\` IS NOT NULL),
    \`schedule_note\` = CASE
      WHEN \`booking_from\` IS NOT NULL AND \`hours\` GLOB '*[0-9]:[0-9][0-9]*' THEN NULL
      ELSE NULLIF(trim(\`hours\`), '')
    END;`)

  await db.run(sql`DROP TABLE \`doctors_days\`;`)
  await db.run(sql`ALTER TABLE \`doctors\` DROP COLUMN \`hours\`;`)
  await db.run(sql`ALTER TABLE \`doctors\` DROP COLUMN \`booking_from\`;`)
  await db.run(sql`ALTER TABLE \`doctors\` DROP COLUMN \`booking_to\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  await db.run(sql`ALTER TABLE \`doctors\` ADD \`hours\` text NOT NULL DEFAULT '';`)
  await db.run(sql`ALTER TABLE \`doctors\` ADD \`booking_from\` text;`)
  await db.run(sql`ALTER TABLE \`doctors\` ADD \`booking_to\` text;`)
  // Data: days back from the sessions; the first timed session becomes the
  // booking window and the hours text.
  await db.run(sql`INSERT INTO \`doctors_days\` (\`order\`, \`parent_id\`, \`value\`)
    SELECT ROW_NUMBER() OVER (PARTITION BY \`_parent_id\` ORDER BY CAST(\`day\` AS integer)), \`_parent_id\`, \`day\`
    FROM (SELECT DISTINCT \`_parent_id\`, \`day\` FROM \`doctors_schedule\`);`)
  await db.run(sql`UPDATE \`doctors\` SET
    \`booking_from\` = (SELECT \`from\` FROM \`doctors_schedule\` s WHERE s.\`_parent_id\` = \`doctors\`.\`id\` AND s.\`from\` IS NOT NULL ORDER BY s.\`_order\` LIMIT 1),
    \`booking_to\` = (SELECT \`to\` FROM \`doctors_schedule\` s WHERE s.\`_parent_id\` = \`doctors\`.\`id\` AND s.\`from\` IS NOT NULL ORDER BY s.\`_order\` LIMIT 1),
    \`hours\` = coalesce(\`schedule_note\`, '');`)
  await db.run(sql`DROP TABLE \`doctors_schedule\`;`)
  await db.run(sql`ALTER TABLE \`doctors\` DROP COLUMN \`schedule_note\`;`)
  await db.run(sql`ALTER TABLE \`doctors\` DROP COLUMN \`bookable\`;`)
}

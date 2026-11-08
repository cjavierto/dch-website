import { existsSync } from 'node:fs'
import path from 'node:path'
import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Data only. The starter content shared one media item between every place a
 * prototype photo appeared (a news post, a health article, a service, a
 * doctor...). Replacing the file for one of them silently changed the others.
 *
 * This gives every place its own copy of the image it shows today, so nothing
 * looks different but each photo can now be replaced on its own. The first
 * place (in the order below) keeps the original item.
 */

type Use = { mediaId: number; where: string; apply: (newId: number) => Promise<void> }

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const uses: Use[] = []
  const rows = async <T>(query: ReturnType<typeof sql>) => (await db.all(query)) as T[]

  // Services: card image, then gallery photos.
  for (const r of await rows<{ id: number; m: number }>(sql`SELECT id, image_id AS m FROM services WHERE image_id IS NOT NULL ORDER BY id`)) {
    uses.push({ mediaId: r.m, where: `service ${r.id}`, apply: async (n) => void (await db.run(sql`UPDATE services SET image_id = ${n} WHERE id = ${r.id}`)) })
  }
  for (const r of await rows<{ id: number; m: number }>(
    sql`SELECT id, media_id AS m FROM services_rels WHERE path = 'detail.gallery' AND media_id IS NOT NULL ORDER BY parent_id, "order"`,
  )) {
    uses.push({ mediaId: r.m, where: `service gallery row ${r.id}`, apply: async (n) => void (await db.run(sql`UPDATE services_rels SET media_id = ${n} WHERE id = ${r.id}`)) })
  }

  // People.
  for (const r of await rows<{ id: number; m: number }>(sql`SELECT id, photo_id AS m FROM doctors WHERE photo_id IS NOT NULL ORDER BY id`)) {
    uses.push({ mediaId: r.m, where: `doctor ${r.id}`, apply: async (n) => void (await db.run(sql`UPDATE doctors SET photo_id = ${n} WHERE id = ${r.id}`)) })
  }
  for (const r of await rows<{ id: number; m: number }>(sql`SELECT id, photo_id AS m FROM staff_members WHERE photo_id IS NOT NULL ORDER BY id`)) {
    uses.push({ mediaId: r.m, where: `staff ${r.id}`, apply: async (n) => void (await db.run(sql`UPDATE staff_members SET photo_id = ${n} WHERE id = ${r.id}`)) })
  }

  // Globals.
  for (const r of await rows<{ id: number; m: number }>(
    sql`SELECT id, media_id AS m FROM about_page_rels WHERE path = 'story.photos' AND media_id IS NOT NULL ORDER BY "order"`,
  )) {
    uses.push({ mediaId: r.m, where: `about page photo ${r.id}`, apply: async (n) => void (await db.run(sql`UPDATE about_page_rels SET media_id = ${n} WHERE id = ${r.id}`)) })
  }
  const [home] = await rows<{ large: number | null; left: number | null; right: number | null }>(
    sql`SELECT facility_photos_large_id AS large, facility_photos_left_id AS left, facility_photos_right_id AS right FROM homepage_settings LIMIT 1`,
  )
  if (home?.large) uses.push({ mediaId: home.large, where: 'homepage large photo', apply: async (n) => void (await db.run(sql`UPDATE homepage_settings SET facility_photos_large_id = ${n}`)) })
  if (home?.left) uses.push({ mediaId: home.left, where: 'homepage left photo', apply: async (n) => void (await db.run(sql`UPDATE homepage_settings SET facility_photos_left_id = ${n}`)) })
  if (home?.right) uses.push({ mediaId: home.right, where: 'homepage right photo', apply: async (n) => void (await db.run(sql`UPDATE homepage_settings SET facility_photos_right_id = ${n}`)) })
  for (const r of await rows<{ id: string; m: number }>(
    sql`SELECT id, logo_id AS m FROM site_settings_accreditation_badges WHERE logo_id IS NOT NULL ORDER BY _order`,
  )) {
    uses.push({ mediaId: r.m, where: `footer logo ${r.id}`, apply: async (n) => void (await db.run(sql`UPDATE site_settings_accreditation_badges SET logo_id = ${n} WHERE id = ${r.id}`)) })
  }

  // Posts have drafts: move the latest version too, or the admin (which edits
  // the latest version) would put the shared image back on the next save.
  for (const r of await rows<{ id: number; m: number }>(sql`SELECT id, cover_id AS m FROM news_posts WHERE cover_id IS NOT NULL ORDER BY id`)) {
    uses.push({
      mediaId: r.m,
      where: `news post ${r.id}`,
      apply: async (n) => {
        await db.run(sql`UPDATE news_posts SET cover_id = ${n} WHERE id = ${r.id}`)
        await db.run(sql`UPDATE _news_posts_v SET version_cover_id = ${n} WHERE parent_id = ${r.id} AND latest = 1 AND version_cover_id = ${r.m}`)
      },
    })
  }
  for (const r of await rows<{ id: number; m: number }>(sql`SELECT id, cover_id AS m FROM articles WHERE cover_id IS NOT NULL ORDER BY id`)) {
    uses.push({
      mediaId: r.m,
      where: `health article ${r.id}`,
      apply: async (n) => {
        await db.run(sql`UPDATE articles SET cover_id = ${n} WHERE id = ${r.id}`)
        await db.run(sql`UPDATE _articles_v SET version_cover_id = ${n} WHERE parent_id = ${r.id} AND latest = 1 AND version_cover_id = ${r.m}`)
      },
    })
  }

  const byMedia = new Map<number, Use[]>()
  for (const u of uses) byMedia.set(u.mediaId, [...(byMedia.get(u.mediaId) ?? []), u])

  const staticDir = path.resolve(process.cwd(), 'media')
  let copies = 0
  for (const [mediaId, list] of byMedia) {
    if (list.length < 2) continue
    const media = await payload.findByID({ collection: 'media', id: mediaId, depth: 0, req }).catch(() => null)
    const file = media?.filename ? path.join(staticDir, media.filename) : ''
    if (!media || !file || !existsSync(file)) {
      payload.logger.warn(`[split media] media ${mediaId} file missing; left shared by: ${list.map((u) => u.where).join(', ')}`)
      continue
    }
    for (const use of list.slice(1)) {
      const copy = await payload.create({
        collection: 'media',
        data: { alt: media.alt },
        filePath: file,
        req,
        context: { skipRevalidate: true },
      })
      await use.apply(copy.id)
      copies++
    }
  }
  payload.logger.info(`[split media] made ${copies} separate image copies`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Nothing to undo: the copies are ordinary images and the site looks the same.
}

/**
 * Imports the prototype content in src/content/* into Payload.
 *
 *   npm run seed            # empty database only
 *   SEED_FORCE=1 npm run seed  # replace all CMS content (inbox entries and users are kept)
 *
 * Images in public/images are uploaded to the media library. The first admin
 * user comes from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.
 */
import path from "node:path";
import config from "@payload-config";
import { getPayload, type CollectionSlug, type Payload } from "payload";
import {
  aboutPage,
  articles,
  careerBenefits,
  doctors,
  faqs,
  homepageSettings,
  jobPostings,
  newsPosts,
  patientsPage,
  services,
  siteSettings,
  staff,
  teamCounts,
  visionPage,
} from "@/content/seed";
import type { Image } from "@/lib/types";
import type { Doctor as PayloadDoctor } from "@/payload-types";
import { blocksToLexical } from "@/payload/richText";
import { legalPagesData } from "@/payload/starterData";

const context = { skipRevalidate: true };
const force = process.argv.includes("--force") || process.env.SEED_FORCE === "1";
/** Seed dates are Manila calendar days; store noon Manila so no timezone shifts the day. */
const manilaNoon = (day: string) => `${day}T12:00:00+08:00`;
const rows = (items: string[] | undefined) => items?.map((text) => ({ text }));

/** Uploads each distinct image once per alt text; empty alt reuses the file's first upload. */
function mediaUploader(payload: Payload) {
  const byKey = new Map<string, number>();
  const bySrc = new Map<string, number>();
  return async function upload(image: Image | string | undefined, fallbackAlt = ""): Promise<number | undefined> {
    if (!image) return undefined;
    const { src, alt } = typeof image === "string" ? { src: image, alt: fallbackAlt } : image;
    if (!alt && bySrc.has(src)) return bySrc.get(src);
    const key = `${src}|${alt}`;
    if (byKey.has(key)) return byKey.get(key);
    const doc = await payload.create({
      collection: "media",
      data: { alt: alt || path.basename(src, path.extname(src)).replaceAll("-", " ") },
      filePath: path.resolve(process.cwd(), "public", src.replace(/^\//, "")),
      context,
    });
    byKey.set(key, doc.id);
    if (!bySrc.has(src)) bySrc.set(src, doc.id);
    return doc.id;
  };
}

const CONTENT: CollectionSlug[] = ["job-postings", "news-posts", "articles", "doctors", "staff-members", "faqs", "services", "media"];

async function seed() {
  const payload = await getPayload({ config });
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`);

  const existing = await payload.count({ collection: "services" });
  if (existing.totalDocs > 0 && !force) {
    log("Content already exists — nothing done. Run `SEED_FORCE=1 npm run seed` to replace it.");
    process.exit(0);
  }
  if (force) {
    for (const collection of CONTENT) {
      await payload.delete({ collection, where: { id: { exists: true } }, context });
    }
    log("Cleared existing content.");
  }

  const upload = mediaUploader(payload);

  // ---- Globals --------------------------------------------------------------
  await payload.updateGlobal({ slug: "site-settings", data: siteSettings, context });
  await payload.updateGlobal({ slug: "homepage-settings", data: homepageSettings, context });
  await payload.updateGlobal({
    slug: "about-page",
    context,
    data: {
      lead: aboutPage.lead,
      story: {
        eyebrow: aboutPage.story.eyebrow,
        heading: aboutPage.story.heading,
        paragraphs: rows(aboutPage.story.paragraphs),
        photos: (await Promise.all(aboutPage.story.photos.map((p) => upload(p)))) as number[],
      },
      milestones: aboutPage.milestones,
      facts: aboutPage.facts,
      teamCounts,
    },
  });
  await payload.updateGlobal({ slug: "vision-page", data: visionPage, context });
  await payload.updateGlobal({
    slug: "patients-page",
    context,
    data: {
      ...patientsPage,
      checklists: patientsPage.checklists.map((c) => ({ ...c, items: rows(c.items) })),
      billing: rows(patientsPage.billing),
    },
  });
  await payload.updateGlobal({ slug: "careers-page", data: { benefits: rows(careerBenefits) }, context });
  await payload.updateGlobal({ slug: "legal-pages", data: legalPagesData(), context });
  log("Globals saved.");

  // ---- Services ---------------------------------------------------------------
  const serviceIds = new Map<string, number>();
  for (const [i, s] of services.entries()) {
    const doc = await payload.create({
      collection: "services",
      context,
      data: {
        ...s,
        sort: (i + 1) * 10,
        image: await upload(s.image),
        home: s.home ? { featured: true, ...s.home } : { featured: false },
        detail: {
          ...s.detail,
          overview: s.detail.overview && {
            heading: s.detail.overview.heading,
            paragraphs: rows(s.detail.overview.paragraphs),
          },
          preparation: rows(s.detail.preparation),
          gallery: s.detail.gallery && ((await Promise.all(s.detail.gallery.map((g) => upload(g)))) as number[]),
        },
      },
    });
    serviceIds.set(s.slug, doc.id);
  }
  log(`${services.length} services.`);

  // ---- People ---------------------------------------------------------------------
  for (const [i, d] of doctors.entries()) {
    await payload.create({
      collection: "doctors",
      context,
      data: {
        ...d,
        photo: await upload(d.photo, d.name),
        service: d.service ? serviceIds.get(d.service) : undefined,
        group: d.group as PayloadDoctor["group"],
        days: d.days.map(String) as PayloadDoctor["days"],
        booking: d.booking as PayloadDoctor["booking"],
        active: true,
        sort: (i + 1) * 10,
      },
    });
  }
  for (const [i, m] of staff.entries()) {
    await payload.create({
      collection: "staff-members",
      context,
      data: { ...m, photo: await upload(m.photo, m.name), sort: (i + 1) * 10 },
    });
  }
  log(`${doctors.length} doctors, ${staff.length} staff.`);

  // ---- News & articles ---------------------------------------------------------
  for (const p of newsPosts) {
    await payload.create({
      collection: "news-posts",
      context,
      data: {
        ...p,
        publishedAt: manilaNoon(p.publishedAt),
        _status: "published",
        cover: (await upload(p.cover))!,
        body: p.body.length ? (blocksToLexical(p.body) as never) : undefined,
        relatedService: p.relatedService ? serviceIds.get(p.relatedService) : undefined,
      },
    });
  }
  for (const a of articles) {
    await payload.create({
      collection: "articles",
      context,
      data: {
        ...a,
        publishedAt: manilaNoon(a.publishedAt),
        _status: "published",
        cover: (await upload(a.cover))!,
        body: a.body.length ? (blocksToLexical(a.body) as never) : undefined,
      },
    });
  }
  log(`${newsPosts.length} news posts, ${articles.length} articles.`);

  // ---- Careers & FAQs ---------------------------------------------------------------
  for (const [i, j] of jobPostings.entries()) {
    await payload.create({
      collection: "job-postings",
      context,
      data: {
        ...j,
        _status: "published",
        duties: rows(j.duties),
        requirements: rows(j.requirements),
        process: rows(j.process),
        sort: (i + 1) * 10,
      },
    });
  }
  for (const [i, f] of faqs.entries()) {
    await payload.create({ collection: "faqs", context, data: { ...f, sort: (i + 1) * 10 } });
  }
  log(`${jobPostings.length} job postings, ${faqs.length} FAQs.`);

  // ---- First admin user -----------------------------------------------------------
  const users = await payload.count({ collection: "users" });
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (users.totalDocs === 0 && email && password) {
    await payload.create({
      collection: "users",
      context,
      data: { email, password, name: "DCH Administrator", role: "Administrator" },
    });
    log(`Admin user ${email} created (password from .env).`);
  }

  log("Done.");
  process.exit(0);
}

await seed();

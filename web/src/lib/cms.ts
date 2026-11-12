/**
 * Content access for the public site. Every page and the global chrome read
 * through these functions — never import seed data or hard-code a phone number
 * in a component.
 *
 * Each function queries Payload through the Local API and maps the document
 * onto the types in src/lib/types.ts. Results are cached with "use cache";
 * afterChange hooks in src/payload/revalidate.ts expire the matching tag so
 * edits in the admin show on the next visit.
 */
import { cacheLife, cacheTag } from "next/cache";
import config from "@payload-config";
import { getPayload, type Where } from "payload";
import { toClosedRanges } from "@/lib/appointments";
import { formatBookingDate, formatTime } from "@/lib/booking";
import { CV_TYPES } from "@/lib/careers";
import type { ContactSubject } from "@/lib/contact";
import type {
  Article,
  Block,
  Doctor,
  Faq,
  HomepageSettings,
  Image,
  JobPosting,
  NewsPost,
  Service,
  SiteSettings,
  StaffMember,
  TeamCount,
} from "@/lib/types";
import { notifyBooking, notifyContact, notifyJobApplication, recipients } from "@/lib/notify";
import type * as P from "@/payload-types";
import { scheduleDays } from "@/lib/schedule";
import { DOCTOR_GROUPS } from "@/payload/collections/People";
import { lexicalToBlocks } from "@/payload/richText";

const payload = () => getPayload({ config });

/** Fills `{emergencyNumber}` and `{trunkline}` in CMS text from settings,
    so phone numbers live in one place. */
function withSettings<T>(value: T, settings: Pick<SiteSettings, "emergencyNumber" | "trunkline" | "email">): T {
  const json = JSON.stringify(value)
    .replaceAll("{emergencyNumber}", settings.emergencyNumber)
    .replaceAll("{trunkline}", settings.trunkline)
    .replaceAll("{email}", settings.email);
  return JSON.parse(json) as T;
}

/** Settings for withSettings. Callers tag their cache entry "site-settings"
    as well, so a number change refreshes every page that prints it. */
async function numbers() {
  cacheTag("site-settings");
  const s = await (await payload()).findGlobal({ slug: "site-settings", depth: 0 });
  return { emergencyNumber: s.emergencyNumber, trunkline: s.trunkline, email: s.email };
}

// ---- Mapping helpers ---------------------------------------------------------

/** null → undefined, so optional fields match src/lib/types. */
const opt = <T>(v: T | null | undefined): T | undefined => v ?? undefined;
/** Empty list → undefined: pages skip sections whose list is missing. */
const list = <T>(v: T[] | null | undefined): T[] | undefined => (v?.length ? v : undefined);
const texts = (rows: { text: string }[] | null | undefined) => list(rows?.map((r) => r.text));
/** Drops Payload's row ids from array fields. */
const strip = <T extends { id?: string | null }>(rows: T[] | null | undefined) =>
  list(
    rows?.map((row) => {
      const rest: Omit<T, "id"> & { id?: unknown } = { ...row };
      delete rest.id;
      return rest as Omit<T, "id">;
    }),
  );

/** Media doc → { src, alt }. URLs are kept relative so next/image treats them as local. */
function image(m: number | P.Media | null | undefined): Image | undefined {
  if (!m || typeof m === "number" || !m.url) return undefined;
  return { src: new URL(m.url, "http://localhost").pathname, alt: m.alt };
}

const slugOf = (rel: number | { slug: string } | null | undefined) =>
  rel && typeof rel === "object" ? rel.slug : undefined;

/** Payload stores dates as ISO timestamps; the site works with Manila calendar days. */
const day = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

const published: Where = { _status: { equals: "published" } };

/** The pasted Google Maps embed code's address, or a map searched from the
    hospital name and address. */
function mapEmbedUrl(s: P.SiteSetting) {
  const pasted = s.mapEmbed?.match(/https:\/\/www\.google\.com\/maps\/embed\?[^"'\s<>]+/)?.[0];
  if (pasted) return pasted.replaceAll("&amp;", "&");
  const a = s.address;
  const query = [s.hospitalName, a.street, a.barangay, a.town, a.province, "Philippines"].filter(Boolean).join(", ");
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

function toSiteSettings(s: P.SiteSetting): SiteSettings {
  return {
    hospitalName: s.hospitalName,
    shortName: s.shortName,
    tagline: s.tagline,
    summary: s.summary,
    address: {
      street: s.address.street,
      barangay: s.address.barangay,
      town: s.address.town,
      postcode: s.address.postcode,
      province: s.address.province,
    },
    emergencyNumber: s.emergencyNumber,
    trunkline: s.trunkline,
    email: s.email,
    careersEmail: s.careersEmail,
    outpatientHours: s.outpatientHours,
    clinicClosures: toClosedRanges(s.clinicClosures),
    mapUrl: s.mapUrl,
    mapEmbedUrl: mapEmbedUrl(s),
    visitingHours: (s.visitingHours ?? []).map(({ area, hours }) => ({ area, hours })),
    visitingRules: s.visitingRules,
    social: { facebook: s.social?.facebook ?? "", messenger: s.social?.messenger ?? "" },
    accreditation: {
      philhealthNumber: s.accreditation.philhealthNumber ?? "",
      dohLicenceLevel: s.accreditation.dohLicenceLevel,
    },
    accreditationBadges: (s.accreditationBadges ?? []).map((b) => ({
      name: b.name,
      subtitle: opt(b.subtitle),
      logo: image(b.logo),
      link: opt(b.link),
    })),
    footerText: s.footerText,
  };
}

function toService(s: P.Service): Service {
  const d = s.detail;
  const overviewParagraphs = texts(d.overview?.paragraphs);
  const gallery = list((d.gallery ?? []).map(image).filter((g): g is Image => Boolean(g)));
  return {
    slug: s.slug,
    name: s.name,
    icon: s.icon,
    emergency: opt(s.emergency) || undefined,
    summary: s.summary,
    summaryShort: s.summaryShort,
    image: image(s.image),
    categories: s.categories,
    categoryLabel: s.categoryLabel,
    tags: (s.tags ?? []).map(({ label, tone }) => ({ label, tone })),
    menuName: opt(s.menuName),
    menuSummary: opt(s.menuSummary),
    inMegaMenu: Boolean(s.inMegaMenu),
    home: s.home?.featured
      ? {
          title: s.home.title ?? s.name,
          summary: s.home.summary ?? s.summary,
          summaryShort: s.home.summaryShort ?? s.summaryShort,
          sort: s.home.sort ?? 1,
        }
      : undefined,
    detail: {
      lead: d.lead,
      ctaLabel: opt(d.ctaLabel),
      secondaryCta: d.secondaryCta?.label && d.secondaryCta.href ? { label: d.secondaryCta.label, href: d.secondaryCta.href } : undefined,
      overview:
        d.overview?.heading || overviewParagraphs
          ? { heading: d.overview?.heading ?? `About ${s.name}`, paragraphs: overviewParagraphs ?? [s.summary] }
          : undefined,
      procedures: strip(d.procedures),
      preparation: texts(d.preparation),
      schedule: strip(d.schedule),
      staff: strip(d.staff),
      emergencyTitle: opt(d.emergencyTitle),
      gallery,
    },
  };
}

function toDoctor(d: P.Doctor): Doctor {
  const schedule = (d.schedule ?? [])
    .map((s) => ({ day: Number(s.day), from: opt(s.from), to: opt(s.to) }))
    .sort((a, b) => a.day - b.day || (a.from ?? "").localeCompare(b.from ?? ""));
  return {
    slug: d.slug,
    name: d.name,
    initials: d.initials,
    photo: image(d.photo)?.src,
    specialty: d.specialty,
    group: d.group,
    service: slugOf(d.service as P.Service | number | null),
    schedule,
    days: scheduleDays(schedule),
    scheduleNote: opt(d.scheduleNote),
    bookable: Boolean(d.bookable),
    daysOff: toClosedRanges(d.daysOff),
  };
}

function toStaff(m: P.StaffMember): StaffMember {
  return {
    name: m.name,
    initials: m.initials,
    photo: image(m.photo)?.src,
    title: m.title,
    group: m.group,
    section: opt(m.section),
    icon: opt(m.icon),
    bio: opt(m.bio),
  };
}

function toNewsPost(p: P.NewsPost): NewsPost {
  const cta = p.sidebarCta;
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    excerptShort: opt(p.excerptShort),
    category: p.category,
    icon: p.icon,
    cover: image(p.cover) ?? { src: "/images/staff-hallway.png", alt: "" },
    coverCaption: opt(p.coverCaption),
    featured: opt(p.featured) || undefined,
    author: opt(p.author),
    publishedAt: day(p.publishedAt),
    body: lexicalToBlocks(p.body),
    relatedService: slugOf(p.relatedService as P.Service | number | null),
    sidebarCta:
      cta?.title && cta.label && cta.href ? { title: cta.title, text: cta.text ?? "", label: cta.label, href: cta.href } : undefined,
  };
}

function toArticle(a: P.Article): Article {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    cover: image(a.cover) ?? { src: "/images/staff-hallway.png", alt: "" },
    author: a.author,
    publishedAt: day(a.publishedAt),
    body: lexicalToBlocks(a.body),
  };
}

function toJob(j: P.JobPosting): JobPosting {
  return {
    slug: j.slug,
    title: j.title,
    department: j.department,
    icon: j.icon,
    employmentType: j.employmentType,
    shift: opt(j.shift),
    openings: opt(j.openings),
    location: j.location,
    role: opt(j.role),
    duties: texts(j.duties),
    requirements: texts(j.requirements),
    compensation: opt(j.compensation),
    licensed: Boolean(j.licensed),
    process: texts(j.process),
  };
}

/** Published postings whose closing day has not passed (Manila time). */
function openJobs(): Where {
  const today = day(new Date().toISOString());
  return {
    and: [
      published,
      { or: [{ closesAt: { exists: false } }, { closesAt: { greater_than_equal: `${today}T00:00:00+08:00` } }] },
    ],
  };
}

// ---- Settings ----------------------------------------------------------

export async function getSiteSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("site-settings");
  const s = await (await payload()).findGlobal({ slug: "site-settings", depth: 1 });
  return toSiteSettings(s);
}

export async function getHomepageSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("homepage");
  const h = await (await payload()).findGlobal({ slug: "homepage-settings", depth: 1 });
  const settings = await numbers();
  return withSettings({
    showStats: Boolean(h.showStats),
    stats: (h.stats ?? []).map(({ value, label, labelShort }) => ({ value, label, labelShort })),
    facilityPhotos: {
      large: image(h.facilityPhotos?.large),
      left: image(h.facilityPhotos?.left),
      right: image(h.facilityPhotos?.right),
    },
    quickLinks: (h.quickLinks ?? []).map((q) => ({
      icon: q.icon,
      title: q.title,
      detail: opt(q.detail),
      link: q.link,
      url: opt(q.url),
    })),
    emergencyCard: {
      title: h.emergencyCard?.title || "Emergency Room",
      detail: h.emergencyCard?.detail ?? "Open 24 hours · {emergencyNumber}",
    },
  } satisfies HomepageSettings, settings);
}

export async function getFaqs() {
  "use cache";
  cacheLife("hours");
  cacheTag("faqs");
  const { docs } = await (await payload()).find({ collection: "faqs", sort: "sort", limit: 100, depth: 0 });
  const faqs: Faq[] = docs.map(({ question, answer }) => ({ question, answer }));
  return withSettings(faqs, await numbers());
}

// ---- Pages ---------------------------------------------------------------

export async function getAboutPage() {
  "use cache";
  cacheLife("hours");
  cacheTag("pages");
  const a = await (await payload()).findGlobal({ slug: "about-page", depth: 1 });
  return {
    lead: a.lead,
    story: {
      eyebrow: a.story.eyebrow,
      heading: a.story.heading,
      paragraphs: texts(a.story.paragraphs) ?? [],
      photos: (a.story.photos ?? []).map(image).filter((p): p is Image => Boolean(p)),
    },
    milestones: (a.milestones ?? []).map(({ year, text }) => ({ year, text })),
    facts: (a.facts ?? []).map(({ icon, title, text }) => ({ icon, title, text })),
  };
}

export async function getVisionPage() {
  "use cache";
  cacheLife("hours");
  cacheTag("pages");
  const v = await (await payload()).findGlobal({ slug: "vision-page", depth: 0 });
  return {
    lead: v.lead,
    vision: v.vision,
    mission: v.mission,
    values: (v.values ?? []).map(({ icon, title, text }) => ({ icon, title, text })),
    rightsNote: v.rightsNote,
  };
}

export async function getPatientsPage() {
  "use cache";
  cacheLife("hours");
  cacheTag("pages");
  const p = await (await payload()).findGlobal({ slug: "patients-page", depth: 0 });
  const page = {
    lead: p.lead,
    bringIntro: p.bringIntro,
    checklists: (p.checklists ?? []).map(({ icon, title, items }) => ({ icon, title, items: texts(items) ?? [] })),
    stepsIntro: p.stepsIntro,
    steps: (p.steps ?? []).map(({ title, text }) => ({ title, text })),
    billing: texts(p.billing) ?? [],
    billingNote: p.billingNote,
  };
  return withSettings(page, await numbers());
}

export type LegalPage = { intro: string; body: Block[]; lastUpdated: string };

/** Privacy notice and patient rights copy. */
export async function getLegalPages() {
  "use cache";
  cacheLife("hours");
  cacheTag("legal");
  const g = await (await payload()).findGlobal({ slug: "legal-pages", depth: 0 });
  const page = (p: { intro?: string | null; body?: unknown; lastUpdated?: string | null } | null | undefined): LegalPage => ({
    intro: p?.intro ?? "",
    body: lexicalToBlocks(p?.body),
    lastUpdated: p?.lastUpdated ? day(p.lastUpdated) : "",
  });
  return withSettings({ privacy: page(g.privacy), patientRights: page(g.patientRights) }, await numbers());
}

// ---- Services --------------------------------------------------------------

async function findServices(where?: Where) {
  const { docs } = await (await payload()).find({ collection: "services", where, sort: "sort", limit: 100, depth: 1 });
  return docs.map(toService);
}

export async function getServices() {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  return withSettings(await findServices(), await numbers());
}

export async function getService(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  const [service] = await findServices({ slug: { equals: slug } });
  return service ? withSettings(service, await numbers()) : null;
}

export async function getMegaMenuServices() {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  return findServices({ inMegaMenu: { equals: true } });
}

export async function getHomepageServices() {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  const services = await findServices({ "home.featured": { equals: true } });
  return services.sort((a, b) => a.home!.sort - b.home!.sort);
}

// ---- Doctors & staff ---------------------------------------------------------

async function findDoctors(where?: Where) {
  const { docs } = await (await payload()).find({
    collection: "doctors",
    where: { and: [{ active: { equals: true } }, ...(where ? [where] : [])] },
    sort: "sort",
    limit: 500,
    depth: 1,
  });
  return docs.map(toDoctor);
}

export async function getDoctors() {
  "use cache";
  cacheLife("hours");
  cacheTag("doctors");
  return { doctors: await findDoctors(), groups: DOCTOR_GROUPS };
}

export async function getDoctorsForService(serviceSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("doctors");
  return findDoctors({ "service.slug": { equals: serviceSlug } });
}

export async function getStaff() {
  "use cache";
  cacheLife("hours");
  cacheTag("staff");
  const p = await payload();
  const [{ docs }, about] = await Promise.all([
    p.find({ collection: "staff-members", sort: "sort", limit: 200, depth: 1 }),
    p.findGlobal({ slug: "about-page", depth: 0 }),
  ]);
  const teamCounts: TeamCount[] = (about.teamCounts ?? []).map(({ count, role, note }) => ({ count, role, note }));
  return { staff: docs.map(toStaff), teamCounts };
}

// ---- News & health information --------------------------------------------

async function findNews(where?: Where, limit = 200) {
  const { docs } = await (await payload()).find({
    collection: "news-posts",
    where: where ? { and: [published, where] } : published,
    sort: "-publishedAt",
    limit,
    depth: 1,
  });
  return docs.map(toNewsPost);
}

export async function getNewsPosts() {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  return findNews();
}

export async function getLatestNews(limit: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  return findNews(undefined, limit);
}

export async function getNewsPost(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  const [post] = await findNews({ slug: { equals: slug } }, 1);
  return post ? withSettings(post, await numbers()) : null;
}

async function findArticles(where?: Where, limit = 200) {
  const { docs } = await (await payload()).find({
    collection: "articles",
    where: where ? { and: [published, where] } : published,
    sort: "-publishedAt",
    limit,
    depth: 1,
  });
  return docs.map(toArticle);
}

export async function getArticles() {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");
  return findArticles();
}

export async function getArticle(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");
  const [article] = await findArticles({ slug: { equals: slug } }, 1);
  return article ? withSettings(article, await numbers()) : null;
}

// ---- Careers ---------------------------------------------------------------

export async function getJobPostings() {
  "use cache";
  cacheLife("minutes");
  cacheTag("jobs");
  const p = await payload();
  const [{ docs }, page] = await Promise.all([
    p.find({ collection: "job-postings", where: openJobs(), sort: "sort", limit: 200, depth: 0 }),
    p.findGlobal({ slug: "careers-page", depth: 0 }),
  ]);
  return { jobs: docs.map(toJob), benefits: texts(page.benefits) ?? [] };
}

export async function getJobPosting(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("jobs");
  const { docs } = await (await payload()).find({
    collection: "job-postings",
    where: { and: [openJobs(), { slug: { equals: slug } }] },
    limit: 1,
    depth: 0,
  });
  return docs[0] ? toJob(docs[0]) : null;
}

// ---- Submissions -------------------------------------------------------------

export type NewContactSubmission = {
  name: string;
  /** Normalised to 09XXXXXXXXX. */
  mobile: string;
  email: string | null;
  subject: ContactSubject;
  message: string;
};

/**
 * Stores a contact form submission in the admin inbox (Inbox → Contact us
 * entries). The Local API bypasses access control, so the public site can
 * create entries that only signed-in staff can read.
 */
export async function saveContactSubmission(s: NewContactSubmission) {
  const p = await payload();
  const doc = await p.create({
    collection: "contact-submissions",
    data: { ...s, status: "new" },
  });
  const settings = await p.findGlobal({ slug: "site-settings", depth: 0 });
  await notifyContact(p, recipients(settings.email, settings.notifications?.contactRecipients), doc.id, s);
}

export type NewJobApplication = {
  jobSlug: string;
  name: string;
  contact: string;
  prcLicence: string | null;
  cv: { name: string; type: string; size: number; data: ArrayBuffer };
};

/**
 * Stores a job application (Inbox → Job applications). The CV is uploaded to
 * the private applicant-files collection, which only signed-in staff can read.
 */
export async function saveJobApplication(a: NewJobApplication) {
  const p = await payload();
  const { docs } = await p.find({ collection: "job-postings", where: { slug: { equals: a.jobSlug } }, limit: 1, depth: 0 });
  if (!docs[0]) throw new Error(`Unknown job posting: ${a.jobSlug}`);

  // Some browsers send no type; validation then accepted the file by extension.
  const mimetype =
    a.cv.type ||
    Object.entries(CV_TYPES).find(([, ext]) => a.cv.name.toLowerCase().endsWith(`.${ext.toLowerCase()}`))?.[0] ||
    "application/octet-stream";
  const cv = await p.create({
    collection: "applicant-files",
    data: {},
    file: { name: a.cv.name, mimetype, size: a.cv.size, data: Buffer.from(a.cv.data) },
  });
  let applicationId: number;
  try {
    ({ id: applicationId } = await p.create({
      collection: "job-applications",
      data: { job: docs[0].id, name: a.name, contact: a.contact, prcLicence: a.prcLicence, cv: cv.id, status: "new" },
    }));
  } catch (err) {
    // Don't leave an orphaned CV behind.
    await p.delete({ collection: "applicant-files", id: cv.id });
    throw err;
  }
  const settings = await p.findGlobal({ slug: "site-settings", depth: 0 });
  await notifyJobApplication(p, recipients(settings.careersEmail, settings.notifications?.applicationRecipients), applicationId, {
    jobTitle: docs[0].title,
    name: a.name,
    contact: a.contact,
    prcLicence: a.prcLicence,
  });
}

// ---- Booking -------------------------------------------------------------------

/** Slot times already requested or confirmed for a doctor on a day. Read
    fresh on every call (not cached) so two patients rarely pick the same slot. */
export async function getTakenSlots(doctorSlug: string, date: string) {
  const p = await payload();
  const { docs: found } = await p.find({ collection: "doctors", where: { slug: { equals: doctorSlug } }, limit: 1, depth: 0 });
  if (!found[0]) return [];
  const { docs } = await p.find({
    collection: "booking-requests",
    where: {
      and: [
        { doctor: { equals: found[0].id } },
        { date: { equals: date } },
        { status: { in: ["requested", "confirmed"] } },
      ],
    },
    limit: 200,
    depth: 0,
    select: { time: true },
  });
  return docs.map((d) => d.time);
}

export type NewBookingRequest = {
  doctorSlug: string;
  department: string;
  date: string;
  time: string;
  name: string;
  /** Normalised to 09XXXXXXXXX. */
  mobile: string;
  philhealth: string | null;
  firstVisit: "yes" | "no";
  reason: string;
};

/** Stores an appointment request (Inbox → Booking entries) for staff to
    confirm by SMS. Throws "slot-taken" if someone got there first. */
export async function saveBookingRequest(r: NewBookingRequest) {
  const p = await payload();
  const { docs } = await p.find({ collection: "doctors", where: { slug: { equals: r.doctorSlug } }, limit: 1, depth: 0 });
  if (!docs[0]) throw new Error(`Unknown doctor: ${r.doctorSlug}`);
  if ((await getTakenSlots(r.doctorSlug, r.date)).includes(r.time)) throw new Error("slot-taken");
  const booking = await p.create({
    collection: "booking-requests",
    data: {
      doctor: docs[0].id,
      department: r.department,
      date: r.date,
      time: r.time,
      name: r.name,
      mobile: r.mobile,
      philhealth: r.philhealth,
      firstVisit: r.firstVisit,
      reason: r.reason,
      status: "requested",
    },
  });
  // No separate OPD address yet: requests go to the contact recipients.
  const settings = await p.findGlobal({ slug: "site-settings", depth: 0 });
  await notifyBooking(p, recipients(settings.email, settings.notifications?.contactRecipients), booking.id, {
    doctorName: docs[0].name,
    date: formatBookingDate(r.date),
    time: formatTime(r.time),
    name: r.name,
    mobile: r.mobile,
    reason: r.reason,
  });
}

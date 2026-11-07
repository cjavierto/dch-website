import type { IconName } from "@/components/Icon";

/** Singleton — everything staff edit under "Website settings". */
export type SiteSettings = {
  hospitalName: string;
  shortName: string;
  tagline: string;
  summary: string;
  address: { street: string; barangay: string; town: string; postcode: string; province: string };
  emergencyNumber: string;
  trunkline: string;
  email: string;
  /** Where CVs go when no posting fits. */
  careersEmail: string;
  outpatientHours: string;
  /** Link to the hospital on a map (directions). */
  mapUrl: string;
  visitingHours: { area: string; hours: string }[];
  visitingRules: string;
  social: { facebook: string; messenger: string };
  accreditation: { philhealthNumber: string; dohLicenceLevel: string };
  /** Footer logos of accrediting bodies and partners, in display order. */
  accreditationBadges: AccreditationBadge[];
  footerText: string;
};

export type AccreditationBadge = { name: string; subtitle?: string; logo?: Image; link?: string };

export type HomepageSettings = {
  showStats: boolean;
  stats: { value: string; label: string; labelShort: string }[];
  /** "Our facility" photos; an empty slot falls back to the built-in photo. */
  facilityPhotos: { large?: Image; left?: Image; right?: Image };
};

export type Image = { src: string; alt: string };

/** Small coloured label. Tones map to the system's tint/ink pairs. */
export type Tag = { label: string; tone: "info" | "success" | "notice" | "danger" };

/** Minimal rich-text blocks — stands in for the CMS rich-text field. */
export type Block =
  | { type: "lead"; text: string }
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite: string };

export const SERVICE_CATEGORIES = [
  { value: "emergency", label: "Emergency" },
  { value: "inpatient", label: "Inpatient" },
  { value: "outpatient", label: "Outpatient" },
  { value: "diagnostics", label: "Diagnostics" },
  { value: "maternal-child", label: "Maternal & child" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

export type Service = {
  slug: string;
  name: string;
  icon: IconName;
  /** Red icon — only the emergency department. */
  emergency?: boolean;
  /** Card copy on the services index. */
  summary: string;
  /** One line under the name in compact (phone) rows. */
  summaryShort: string;
  image?: Image;
  categories: ServiceCategory[];
  /** Label on the detail-page hero capsule, e.g. "Diagnostics". */
  categoryLabel: string;
  tags: Tag[];
  /** Shorter name in the header mega-menu. */
  menuName?: string;
  /** One-line description in the header mega-menu. */
  menuSummary?: string;
  inMegaMenu: boolean;
  /** Present when the service is featured on the homepage. */
  home?: { title: string; summary: string; summaryShort: string; sort: number };
  /** Detail-page content. Sections without content are not rendered. */
  detail: {
    lead: string;
    ctaLabel?: string;
    secondaryCta?: { label: string; href: string };
    overview?: { heading: string; paragraphs: string[] };
    procedures?: { icon: IconName; title: string; detail: string }[];
    preparation?: string[];
    schedule?: { icon: IconName; text: string }[];
    /** Named staff. Falls back to the department's doctors. */
    staff?: { name: string; role: string; initials: string }[];
    emergencyTitle?: string;
    gallery?: Image[];
  };
};

export type Faq = { question: string; answer: string };

export const NEWS_CATEGORIES = [
  { value: "advisory", label: "Advisories", tag: "Advisory" },
  { value: "service-update", label: "Service updates", tag: "Service update" },
  { value: "community", label: "Community", tag: "Community" },
  { value: "careers", label: "Careers", tag: "Careers" },
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]["value"];

export type NewsPost = {
  slug: string;
  title: string;
  /** Card and homepage summary. */
  excerpt: string;
  /** Shorter summary for the homepage list, when the excerpt is long. */
  excerptShort?: string;
  category: NewsCategory;
  icon: IconName;
  cover: Image;
  coverCaption?: string;
  /** Shown as the large card at the top of the news page. */
  featured?: boolean;
  author?: string;
  /** ISO date, YYYY-MM-DD. */
  publishedAt: string;
  /** Empty until the post is written in the CMS. */
  body: Block[];
  relatedService?: string;
  sidebarCta?: { title: string; text: string; label: string; href: string };
};

// Alphabetical, so the CMS dropdown is easy to scan. Values are stored on
// posts: rename a label freely, but never change or remove a value in use.
export const ARTICLE_CATEGORIES = [
  { value: "cancer", label: "Cancer" },
  { value: "diabetes-hypertension", label: "Diabetes & hypertension" },
  { value: "first-aid", label: "First aid" },
  { value: "flu-respiratory", label: "Flu & respiratory illness" },
  { value: "heart-health", label: "Heart health" },
  { value: "infectious-disease", label: "Infectious disease" },
  { value: "kidney-health", label: "Kidney health" },
  { value: "mental-health", label: "Mental health" },
  { value: "mother-child", label: "Mother & child" },
  { value: "nutrition", label: "Nutrition" },
  { value: "senior-health", label: "Senior health" },
  { value: "vaccines", label: "Vaccines & immunization" },
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]["value"];

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  cover: Image;
  author: string;
  publishedAt: string;
  body: Block[];
};

export type Doctor = {
  slug: string;
  name: string;
  initials: string;
  photo?: string;
  specialty: string;
  /** Directory filter group. */
  group: string;
  /** Service slug, for "related doctors" on a department page. */
  service?: string;
  /** Regular clinic days, 0 = Mon … 5 = Sat. */
  days: number[];
  hours: string;
  /** Clinic window for online booking ("HH:MM", 24h). Absent = not bookable. */
  booking?: { from: string; to: string };
};

export type StaffMember = {
  name: string;
  initials: string;
  photo?: string;
  title: string;
  group: "director" | "leadership" | "department-head";
  section?: string;
  icon?: IconName;
  bio?: string;
};

export type TeamCount = { count: number; role: string; note: string };

export type JobPosting = {
  slug: string;
  title: string;
  department: string;
  icon: IconName;
  employmentType: "Full-time" | "Part-time" | "Contract";
  /** Extra detail after the type, e.g. "rotating shifts". */
  shift?: string;
  openings?: number;
  location: string;
  role?: string;
  duties?: string[];
  requirements?: string[];
  compensation?: string;
  /** Ask for a PRC licence number on the application form. */
  licensed: boolean;
  process?: string[];
};

export type ChecklistGroup = { icon: IconName; title: string; items: string[] };

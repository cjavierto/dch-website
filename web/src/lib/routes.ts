import { BOOKING_ENABLED } from "@/lib/features";

/** Public site routes. Keep every href in one place. */
export const routes = {
  home: "/",
  about: "/about",
  vision: "/about/vision-and-values",
  leadership: "/about/leadership",
  services: "/services",
  service: (slug: string) => `/services/${slug}`,
  patients: "/patients-and-visitors",
  doctors: "/doctors",
  news: "/news",
  newsPost: (slug: string) => `/news/${slug}`,
  health: "/health-information",
  healthArticle: (slug: string) => `/health-information/${slug}`,
  careers: "/careers",
  job: (slug: string) => `/careers/${slug}`,
  contact: "/contact",
  /** Every "Book Appointment" CTA. While booking is switched off (see
      lib/features.ts) it lands on the contact form with the subject preset. */
  book: BOOKING_ENABLED ? "/book" : "/contact?subject=appointment",
  booking: "/book",
  /** Self-service booking (Calendly-style), not linked from the site yet. */
  bookAppointment: "/book-appointment",
  manageAppointment: (token: string) => `/book-appointment/manage/${token}`,
  privacy: "/privacy",
  patientRights: "/patient-rights",
  sitemap: "/sitemap",
} as const;

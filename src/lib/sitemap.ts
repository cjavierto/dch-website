/**
 * Every public page, grouped — feeds the /sitemap page and /sitemap.xml so the
 * two never drift apart.
 */
import { getArticles, getJobPostings, getNewsPosts, getServices } from "@/lib/cms";
import { BOOKING_ENABLED } from "@/lib/features";
import { routes } from "@/lib/routes";

export type SitemapLink = { href: string; label: string };
export type SitemapGroup = { heading: string; links: SitemapLink[] };

export async function getSitemap(): Promise<SitemapGroup[]> {
  const [services, news, articles, { jobs }] = await Promise.all([
    getServices(),
    getNewsPosts(),
    getArticles(),
    getJobPostings(),
  ]);

  return [
    {
      heading: "Hospital",
      links: [
        { href: routes.home, label: "Home" },
        { href: routes.about, label: "About DCH" },
        { href: routes.vision, label: "Vision & Values" },
        { href: routes.leadership, label: "Our Staff & Leadership Team" },
        { href: routes.contact, label: "Contact us" },
        ...(BOOKING_ENABLED ? [{ href: routes.booking, label: "Book an appointment" }] : []),
      ],
    },
    {
      heading: "Patients",
      links: [
        { href: routes.patients, label: "Patients & Visitors" },
        { href: routes.doctors, label: "Doctors Directory" },
        { href: routes.patientRights, label: "Patient rights & responsibilities" },
        { href: routes.privacy, label: "Privacy notice" },
      ],
    },
    {
      heading: "Services & departments",
      links: [{ href: routes.services, label: "All services" }, ...services.map((s) => ({ href: routes.service(s.slug), label: s.name }))],
    },
    {
      heading: "News & announcements",
      links: [{ href: routes.news, label: "All news" }, ...news.map((p) => ({ href: routes.newsPost(p.slug), label: p.title }))],
    },
    {
      heading: "Health information",
      links: [
        { href: routes.health, label: "All health guides" },
        ...articles.map((a) => ({ href: routes.healthArticle(a.slug), label: a.title })),
      ],
    },
    {
      heading: "Careers",
      links: [{ href: routes.careers, label: "Open positions" }, ...jobs.map((j) => ({ href: routes.job(j.slug), label: j.title }))],
    },
  ];
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSitemap } from "@/lib/sitemap";

/** /sitemap.xml for search engines — same pages as the /sitemap page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const groups = await getSitemap();
  const hrefs = [...new Set(groups.flatMap((g) => g.links.map((l) => l.href)))];
  return hrefs.map((href) => ({ url: `${SITE_URL}${href}` }));
}

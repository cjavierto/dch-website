import type { MetadataRoute } from "next";
import { getSitemap } from "@/lib/sitemap";

/** /sitemap.xml for search engines — same pages as the /sitemap page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(/\/$/, "");
  const groups = await getSitemap();
  const hrefs = [...new Set(groups.flatMap((g) => g.links.map((l) => l.href)))];
  return hrefs.map((href) => ({ url: `${origin}${href}` }));
}

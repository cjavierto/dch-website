import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

/** /robots.txt — the production domain is crawlable; staging and local builds are not. */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/deploy-hook"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

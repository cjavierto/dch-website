/** Public origin the site is built for (NEXT_PUBLIC_SERVER_URL, inlined at build). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(/\/$/, "");

const PRODUCTION_HOSTS = ["deiparinecommunityhospital.ph", "www.deiparinecommunityhospital.ph"];

/**
 * Only a build for the real domain may be indexed by search engines. Staging
 * (staging.deiparinecommunityhospital.ph) and local builds are noindex.
 */
export const INDEXABLE = PRODUCTION_HOSTS.includes(new URL(SITE_URL).hostname);

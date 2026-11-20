// Plain JavaScript, not next.config.ts: the production server would need
// Next's SWC compiler to read a TypeScript config, and the SWC build in
// Next.js 16.4.6 needs a newer Linux (GLIBC 2.29) than the shared hosting
// has, so the app failed to start. Keep this file .mjs.
import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import("next").NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Resized images are cached on the server and in browsers for 30 days
    // (default 4 hours). Safe because CMS uploads get a new file name when
    // replaced; if a file in public/images is replaced, give it a new name.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Fewer widths than the default (8): each variant is made once on the
    // shared server, so fewer variants means more cache hits. 3840/2048 are
    // never needed — no image on the site is wider than the 1192px layout.
    deviceSizes: [640, 828, 1080, 1440, 1920],
  },
  experimental: {
    serverActions: {
      // Job applications carry a CV (max 5 MB, see src/lib/careers.ts).
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });

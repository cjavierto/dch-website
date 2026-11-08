import path from "node:path";
import type { CollectionConfig } from "payload";
import { CV_MAX_BYTES, CV_TYPES } from "@/lib/careers";
import { optimizeExistingMedia } from "../optimizeMedia";
import { ALL_TAGS, expire, revalidateCollection } from "../revalidate";

/**
 * Public images, stored on disk in the app folder (media/). That is fine on
 * Namecheap shared hosting, where the folder persists; keep media/ out of
 * code-only deploys so uploads are not overwritten, and include it in backups.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Media library" },
  admin: { group: "Library", useAsTitle: "alt", defaultColumns: ["filename", "alt", "updatedAt"] },
  access: { read: () => true },
  // Alt text and files appear across the site.
  hooks: revalidateCollection(...ALL_TAGS),
  endpoints: [
    {
      // One-off: shrink images uploaded before resizeOptions existed. A signed-in
      // editor opens /api/media/optimize-existing; each visit does one batch.
      path: "/optimize-existing",
      method: "get",
      handler: async (req) => {
        if (!req.user) return Response.json({ error: "Sign in to /admin first, then open this link again." }, { status: 401 });
        const result = await optimizeExistingMedia(req.payload, req);
        if (result.done.length) expire(ALL_TAGS, req);
        const message =
          result.remaining > 0
            ? `Optimised ${result.done.length} image(s). ${result.remaining} left: reload this page to continue.`
            : result.failed.length
              ? `Finished, but ${result.failed.length} image(s) could not be optimised (see "failed").`
              : "All images are optimised.";
        return Response.json({ message, ...result });
      },
    },
  ],
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
    // Shrink uploads on the way in: phone photos and PNG exports are often
    // 3–10 MB, which makes the first load of every thumbnail slow on shared
    // hosting. 2400px covers the widest slot at 2× screens; WebP keeps
    // transparency (logos). SVGs are stored as uploaded; GIFs become stills.
    resizeOptions: { width: 2400, height: 2400, fit: "inside", withoutEnlargement: true },
    formatOptions: { format: "webp", options: { quality: 82 } },
    adminThumbnail: "thumbnail",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 75 } },
      },
    ],
  },
  fields: [
    {
      name: "alt",
      label: "Alt text",
      type: "text",
      required: true,
      admin: { description: "Describe the photo for people using screen readers, e.g. “CT suite”." },
    },
  ],
};

/**
 * CVs attached to job applications. Kept apart from Media because they hold
 * personal data: only signed-in staff can read or download them.
 */
export const ApplicantFiles: CollectionConfig = {
  slug: "applicant-files",
  labels: { singular: "Applicant CV", plural: "Applicant CVs" },
  admin: { group: "Inbox", defaultColumns: ["filename", "filesize", "createdAt"] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: path.resolve(process.cwd(), "uploads/cvs"),
    mimeTypes: Object.keys(CV_TYPES),
    filesRequiredOnCreate: true,
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        if (req.file && req.file.size > CV_MAX_BYTES) throw new Error("CV must be 5 MB or smaller.");
      },
    ],
  },
  fields: [],
};

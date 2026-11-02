import path from "node:path";
import type { CollectionConfig } from "payload";
import { CV_MAX_BYTES, CV_TYPES } from "@/lib/careers";
import { ALL_TAGS, revalidateCollection } from "../revalidate";

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
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
    adminThumbnail: "thumbnail",
    imageSizes: [{ name: "thumbnail", width: 400, height: 300, position: "centre" }],
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

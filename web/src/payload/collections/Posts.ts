import type { CollectionConfig, Field } from "payload";
import { ARTICLE_CATEGORIES, NEWS_CATEGORIES } from "@/lib/types";
import { bodyField, iconField, imageField, slugField } from "../fields";
import { revalidateCollection } from "../revalidate";

const publishedAt: Field = {
  name: "publishedAt",
  label: "Publish date",
  type: "date",
  required: true,
  defaultValue: () => new Date().toISOString(),
  admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" } },
};

export const NewsPosts: CollectionConfig = {
  slug: "news-posts",
  labels: { singular: "Announcement", plural: "News & announcements" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "featured", "_status"],
  },
  defaultSort: "-publishedAt",
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: revalidateCollection("news"),
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      admin: { description: "Card and homepage summary." },
    },
    { name: "excerptShort", type: "text", admin: { description: "Shorter homepage summary, when the excerpt is long." } },
    imageField("cover", { required: true }),
    { name: "coverCaption", type: "text" },
    bodyField,
    {
      name: "sidebarCta",
      label: "Sidebar call to action",
      type: "group",
      admin: { description: "Optional box beside the article. Leave the title empty to hide it." },
      fields: [
        { name: "title", type: "text" },
        { name: "text", type: "textarea" },
        {
          type: "row",
          fields: [
            { name: "label", type: "text" },
            { name: "href", type: "text" },
          ],
        },
      ],
    },
    slugField("title"),
    publishedAt,
    {
      name: "category",
      type: "select",
      required: true,
      options: NEWS_CATEGORIES.map((c) => ({ label: c.tag, value: c.value })),
      admin: { position: "sidebar" },
    },
    iconField("icon", { required: true, defaultValue: "campaign", admin: { position: "sidebar" } }),
    {
      name: "featured",
      label: "Pinned (large card on the News page)",
      type: "checkbox",
      admin: { position: "sidebar" },
    },
    { name: "author", type: "text", admin: { position: "sidebar" } },
    {
      name: "relatedService",
      type: "relationship",
      relationTo: "services",
      admin: { position: "sidebar" },
    },
  ],
};

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: { singular: "Health article", plural: "Health information" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "author", "publishedAt", "_status"],
  },
  defaultSort: "-publishedAt",
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: revalidateCollection("articles"),
  fields: [
    { name: "title", type: "text", required: true },
    { name: "excerpt", type: "textarea", required: true },
    imageField("cover", { required: true }),
    bodyField,
    slugField("title"),
    publishedAt,
    {
      name: "category",
      type: "select",
      required: true,
      options: ARTICLE_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
      admin: { position: "sidebar" },
    },
    { name: "author", type: "text", required: true, admin: { position: "sidebar" } },
  ],
};

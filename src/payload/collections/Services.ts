import type { CollectionConfig } from "payload";
import { SERVICE_CATEGORIES } from "@/lib/types";
import { iconField, imageField, slugField, sortField, tagsField, textList } from "../fields";
import { revalidateCollection } from "../revalidate";

export const Services: CollectionConfig = {
  slug: "services",
  labels: { singular: "Service", plural: "Services" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "categoryLabel", "inMegaMenu", "sort"],
    description: "Departments and services. Each has a page at /services/<slug>.",
  },
  defaultSort: "sort",
  // Doctors list their department by slug, so they change with services.
  hooks: revalidateCollection("services", "doctors"),
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Listing",
          fields: [
            { name: "name", type: "text", required: true },
            {
              type: "row",
              fields: [
                iconField("icon", { required: true }),
                {
                  name: "emergency",
                  type: "checkbox",
                  admin: { description: "Red icon — the emergency department only." },
                },
              ],
            },
            { name: "summary", type: "textarea", required: true, admin: { description: "Card copy on the services index." } },
            { name: "summaryShort", type: "text", required: true, admin: { description: "One line under the name on phones." } },
            imageField("image"),
            {
              name: "categories",
              type: "select",
              hasMany: true,
              required: true,
              options: SERVICE_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
            },
            { name: "categoryLabel", type: "text", required: true, admin: { description: 'Hero capsule label, e.g. "Diagnostics".' } },
            tagsField,
          ],
        },
        {
          label: "Menu & homepage",
          fields: [
            { name: "inMegaMenu", label: "Show in the header Services menu", type: "checkbox" },
            { name: "menuName", type: "text", admin: { description: "Shorter name for the menu (optional)." } },
            { name: "menuSummary", type: "text", admin: { description: "One-line description in the menu." } },
            {
              name: "home",
              label: "Homepage",
              type: "group",
              fields: [
                { name: "featured", label: "Feature on the homepage", type: "checkbox" },
                {
                  type: "collapsible",
                  label: "Homepage card",
                  admin: { condition: (_, sibling) => Boolean(sibling?.featured) },
                  fields: [
                    { name: "title", type: "text" },
                    { name: "summary", type: "textarea" },
                    { name: "summaryShort", type: "text" },
                    { name: "sort", type: "number", defaultValue: 1 },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Detail page",
          description: "Sections left empty are not shown. Use {emergencyNumber} or {trunkline} for phone numbers.",
          fields: [
            {
              name: "detail",
              type: "group",
              label: false,
              fields: [
                { name: "lead", type: "textarea", required: true },
                {
                  type: "row",
                  fields: [
                    { name: "ctaLabel", type: "text", admin: { description: 'Default "Book an appointment".' } },
                    { name: "emergencyTitle", type: "text" },
                  ],
                },
                {
                  name: "secondaryCta",
                  type: "group",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        { name: "label", type: "text" },
                        { name: "href", type: "text" },
                      ],
                    },
                  ],
                },
                {
                  name: "overview",
                  type: "group",
                  fields: [{ name: "heading", type: "text" }, textList("paragraphs", "Paragraphs")],
                },
                {
                  name: "procedures",
                  type: "array",
                  fields: [
                    iconField("icon", { required: true }),
                    { name: "title", type: "text", required: true },
                    { name: "detail", type: "text", required: true },
                  ],
                },
                textList("preparation", "Preparation"),
                {
                  name: "schedule",
                  type: "array",
                  fields: [iconField("icon", { required: true }), { name: "text", type: "text", required: true }],
                },
                {
                  name: "staff",
                  type: "array",
                  admin: { description: "Named staff. When empty, the department's doctors are shown." },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        { name: "name", type: "text", required: true },
                        { name: "role", type: "text", required: true },
                        { name: "initials", type: "text", required: true, maxLength: 3 },
                      ],
                    },
                  ],
                },
                imageField("gallery", { hasMany: true } as never),
              ],
            },
          ],
        },
      ],
    },
    slugField("name"),
    sortField,
  ],
};

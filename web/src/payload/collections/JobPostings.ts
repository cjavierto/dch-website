import type { CollectionConfig } from "payload";
import { iconField, slugField, sortField, textList } from "../fields";
import { revalidateCollection } from "../revalidate";

export const JobPostings: CollectionConfig = {
  slug: "job-postings",
  labels: { singular: "Job posting", plural: "Careers" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "department", "employmentType", "closesAt", "_status"],
  },
  defaultSort: "sort",
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: revalidateCollection("jobs"),
  fields: [
    { name: "title", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "department", type: "text", required: true },
        iconField("icon", { required: true }),
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "employmentType",
          type: "select",
          required: true,
          defaultValue: "Full-time",
          options: ["Full-time", "Part-time", "Contract"],
        },
        { name: "shift", type: "text", admin: { description: 'Extra detail after the type, e.g. "rotating shifts".' } },
        { name: "openings", type: "number", min: 1 },
      ],
    },
    { name: "location", type: "text", required: true, defaultValue: "Sibonga, Cebu" },
    {
      name: "licensed",
      label: "Requires a PRC licence",
      type: "checkbox",
      admin: { description: "Asks applicants for their PRC licence number." },
    },
    { name: "role", label: "About the role", type: "textarea" },
    textList("duties", "Duties"),
    textList("requirements", "Requirements"),
    { name: "compensation", type: "textarea" },
    textList("process", "Hiring process"),
    slugField("title"),
    {
      name: "closesAt",
      label: "Closing date",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" },
        description: "Hidden from the site after this day. Leave empty to keep it open.",
      },
    },
    sortField,
  ],
};

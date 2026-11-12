/** Field builders shared by several collections and globals. */
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { ArrayField, Field, SelectField, UploadField } from "payload";
import { ICON_NAMES } from "@/components/Icon";

export const iconField = (name = "icon", extra: Partial<SelectField> = {}): SelectField => ({
  name,
  type: "select",
  options: ICON_NAMES.map((n) => ({ label: n.replaceAll("_", " "), value: n })),
  admin: { description: "Material Symbols icon name." },
  ...extra,
} as SelectField);

export const imageField = (name: string, extra: Partial<UploadField> = {}): UploadField => ({
  name,
  type: "upload",
  relationTo: "media",
  ...extra,
} as UploadField);

/** A list of plain strings, stored as rows of { text }. */
export const textList = (name: string, label?: string, extra: Partial<ArrayField> = {}): ArrayField => ({
  name,
  label,
  type: "array",
  labels: { singular: "Item", plural: "Items" },
  fields: [{ name: "text", type: "textarea", required: true }],
  ...extra,
} as ArrayField);

export const slugField = (from: string): Field => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: { position: "sidebar", description: `URL part, e.g. "imaging-radiology". Changing it breaks old links.` },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const source = (value as string | undefined) || (data?.[from] as string | undefined) || "";
        return source
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      },
    ],
  },
});

export const sortField: Field = {
  name: "sort",
  type: "number",
  defaultValue: 100,
  admin: { position: "sidebar", description: "Lower numbers are listed first." },
};

export const tagsField: ArrayField = {
  name: "tags",
  type: "array",
  fields: [
    { name: "label", type: "text", required: true },
    {
      name: "tone",
      type: "select",
      required: true,
      defaultValue: "info",
      options: [
        { label: "Info (navy)", value: "info" },
        { label: "Success (green)", value: "success" },
        { label: "Notice (gold)", value: "notice" },
        { label: "Danger (red — emergency only)", value: "danger" },
      ],
    },
  ],
};

/** Body editor limited to what components/ui/RichText renders. */
export const bodyEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2"] }),
    UnorderedListFeature(),
    BlocksFeature({
      blocks: [
        {
          slug: "lead",
          labels: { singular: "Lead paragraph", plural: "Lead paragraphs" },
          fields: [{ name: "text", type: "textarea", required: true }],
        },
        {
          slug: "pullQuote",
          labels: { singular: "Pull quote", plural: "Pull quotes" },
          fields: [
            { name: "quote", type: "textarea", required: true },
            { name: "cite", label: "Attribution", type: "text", required: true },
          ],
        },
      ],
    }),
    FixedToolbarFeature(),
  ],
});

export const bodyField: Field = {
  name: "body",
  type: "richText",
  editor: bodyEditor,
  admin: {
    description:
      "Use {emergencyNumber} or {trunkline} to insert the numbers from Website settings. Leave empty to show the summary and a “being prepared” note.",
  },
};

/** Dates nobody can book: a list of single days or ranges (leave, holidays). */
export const closedDaysField = (name: string, label: string, description: string): ArrayField => ({
  name,
  label,
  type: "array",
  labels: { singular: "Closed date", plural: "Closed dates" },
  admin: { description, initCollapsed: false },
  fields: [
    {
      type: "row",
      fields: [
        { name: "from", label: "From", type: "date", required: true, admin: { width: "30%", date: { pickerAppearance: "dayOnly", displayFormat: "MMM d, yyyy" } } },
        {
          name: "to",
          label: "Until (optional)",
          type: "date",
          admin: { width: "30%", date: { pickerAppearance: "dayOnly", displayFormat: "MMM d, yyyy" }, description: "Leave empty for one day." },
          validate: (value: unknown, { siblingData }: { siblingData?: { from?: string | null } }) => {
            if (!value || !siblingData?.from) return true;
            return new Date(String(value)) >= new Date(siblingData.from) || "Must be on or after the first day.";
          },
        },
        { name: "note", label: "Reason (staff only)", type: "text", admin: { width: "40%", placeholder: "Leave, conference, holiday…" } },
      ],
    },
  ],
});

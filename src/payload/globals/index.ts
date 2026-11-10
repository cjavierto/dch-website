import { QUICK_LINK_TARGETS } from "@/lib/types";
import type { ArrayField, GlobalConfig } from "payload";
import { iconField, imageField, textList } from "../fields";
import { revalidateGlobal } from "../revalidate";

const iconCards = (name: string, label: string): ArrayField => ({
  name,
  label,
  type: "array",
  fields: [
    iconField("icon", { required: true }),
    { name: "title", type: "text", required: true },
    { name: "text", type: "textarea", required: true },
  ],
});

const numbersNote = "Use {emergencyNumber} or {trunkline} to insert the numbers from Website settings.";

/** Extra people who receive a notice email, one address per row. */
const recipientList = (name: string, label: string): ArrayField => ({
  name,
  label,
  type: "array",
  maxRows: 10,
  labels: { singular: "Recipient", plural: "Recipients" },
  fields: [{ name: "email", type: "email", required: true }],
});

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Website settings",
  admin: { group: "Settings", description: "Feeds the header, footer and contact page across the whole site." },
  hooks: { afterChange: revalidateGlobal("site-settings") },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hospital",
          fields: [
            { type: "row", fields: [{ name: "hospitalName", type: "text", required: true }, { name: "shortName", type: "text", required: true }] },
            { name: "tagline", type: "text", required: true },
            { name: "summary", type: "textarea", required: true },
            {
              name: "address",
              type: "group",
              fields: [
                { type: "row", fields: [{ name: "street", type: "text", required: true }, { name: "barangay", type: "text", required: true }] },
                {
                  type: "row",
                  fields: [
                    { name: "town", type: "text", required: true },
                    { name: "postcode", type: "text", required: true },
                    { name: "province", type: "text", required: true },
                  ],
                },
              ],
            },
            { name: "mapUrl", label: "Map link (directions)", type: "text", required: true },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              type: "row",
              fields: [
                { name: "emergencyNumber", label: "Emergency number", type: "text", required: true },
                { name: "trunkline", type: "text", required: true },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "email", type: "email", required: true },
                { name: "careersEmail", type: "email", required: true, admin: { description: "Where CVs go when no posting fits." } },
              ],
            },
            {
              name: "social",
              type: "group",
              fields: [{ type: "row", fields: [{ name: "facebook", type: "text" }, { name: "messenger", type: "text" }] }],
            },
            {
              name: "notifications",
              label: "Email notifications",
              type: "group",
              admin: {
                description:
                  "Who gets an email when the website receives something. The Email / Careers email above always get them; add anyone else here.",
              },
              fields: [
                recipientList("contactRecipients", "Also send contact messages to"),
                recipientList("applicationRecipients", "Also send job applications to"),
              ],
            },
          ],
        },
        {
          label: "Hours & visiting",
          fields: [
            { name: "outpatientHours", type: "text", required: true },
            {
              name: "visitingHours",
              type: "array",
              fields: [{ type: "row", fields: [{ name: "area", type: "text", required: true }, { name: "hours", type: "text", required: true }] }],
            },
            { name: "visitingRules", type: "textarea", required: true },
          ],
        },
        {
          label: "Accreditation & footer",
          fields: [
            {
              name: "accreditation",
              type: "group",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "philhealthNumber", label: "PhilHealth accreditation no.", type: "text" },
                    { name: "dohLicenceLevel", label: "DOH licence level", type: "text", required: true },
                  ],
                },
              ],
            },
            {
              name: "accreditationBadges",
              label: "Footer logos (accreditations & partners)",
              type: "array",
              labels: { singular: "Logo", plural: "Logos" },
              admin: {
                description:
                  "Shown in the footer under \"Licensed & accredited\", in this order. Drag to reorder; remove a row to take a logo off the site. Use the organisation's official logo (PNG or SVG, transparent or white background).",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", label: "Organisation", type: "text", required: true, admin: { placeholder: "PhilHealth" } },
                    { name: "subtitle", label: "Line under the name", type: "text", admin: { placeholder: "Accredited facility" } },
                  ],
                },
                imageField("logo", { admin: { description: "Leave empty to show the name only." } }),
                {
                  name: "link",
                  label: "Link (optional)",
                  type: "text",
                  admin: { description: "Their website, e.g. https://www.philhealth.gov.ph. Opens in a new tab." },
                  validate: (v: string | null | undefined) =>
                    !v || /^https?:\/\//.test(v) || "Start the link with https://",
                },
              ],
            },
            { name: "footerText", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};

export const HomepageSettings: GlobalConfig = {
  slug: "homepage-settings",
  label: "Homepage",
  admin: { group: "Settings" },
  hooks: { afterChange: revalidateGlobal("homepage") },
  fields: [
    {
      name: "quickLinks",
      label: "Shortcut cards",
      labels: { singular: "Shortcut card", plural: "Shortcut cards" },
      type: "array",
      minRows: 1,
      maxRows: 5,
      admin: {
        description:
          "The cards under the hero, in order. The red emergency card always comes last (below). Phones show two cards per row, so 3 or 5 here gives even rows.",
        components: { RowLabel: "@/payload/admin/QuickLinkLabel#QuickLinkLabel" },
        initCollapsed: true,
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", type: "text", required: true, maxLength: 40, admin: { width: "50%" } },
            iconField("icon", { required: true, admin: { width: "50%", description: "Material Symbols icon name." } }),
          ],
        },
        {
          name: "detail",
          label: "Short line",
          type: "text",
          maxLength: 60,
          admin: { description: "Shown on computers only, under the title." },
        },
        {
          type: "row",
          fields: [
            {
              name: "link",
              label: "Opens",
              type: "select",
              required: true,
              defaultValue: "contact",
              options: QUICK_LINK_TARGETS.map((t) => ({ label: t.label, value: t.value })),
              admin: { width: "50%" },
            },
            {
              name: "url",
              label: "Link",
              type: "text",
              admin: {
                width: "50%",
                condition: (_, row) => row?.link === "custom",
                description: 'A page on this site, like "/careers/staff-nurse", or a full https:// address.',
              },
              validate: (value: unknown, { siblingData }: { siblingData?: { link?: string } }) => {
                if (siblingData?.link !== "custom") return true;
                const v = String(value ?? "").trim();
                if (!v) return "Enter the link.";
                return /^(\/|https?:\/\/)/.test(v) || 'Start with "/" for a page on this site, or "https://".';
              },
            },
          ],
        },
      ],
    },
    {
      name: "emergencyCard",
      label: "Emergency card",
      type: "group",
      admin: {
        description: "The red card. It always calls the emergency number from Website settings; write {emergencyNumber} to show the number.",
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", type: "text", required: true, defaultValue: "Emergency Room", maxLength: 40, admin: { width: "50%" } },
            {
              name: "detail",
              label: "Short line",
              type: "text",
              defaultValue: "Open 24 hours · {emergencyNumber}",
              maxLength: 60,
              admin: { width: "50%" },
            },
          ],
        },
      ],
    },
    { name: "showStats", label: "Show the stats strip", type: "checkbox", defaultValue: true },
    {
      name: "stats",
      type: "array",
      maxRows: 4,
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "text", required: true },
            { name: "label", type: "text", required: true },
            { name: "labelShort", label: "Label (phones)", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "facilityPhotos",
      label: "\"Our facility\" photos",
      type: "group",
      admin: {
        description:
          "The three photos beside \"Built for the community it serves\". Leave a slot empty to keep the current photo. Landscape photos work best; describe each one in its Alt text.",
      },
      fields: [
        imageField("large", { label: "Large photo (top)" }),
        {
          type: "row",
          fields: [
            imageField("left", { label: "Small photo (left)" }),
            imageField("right", { label: "Small photo (right)" }),
          ],
        },
      ],
    },
  ],
};

export const AboutPage: GlobalConfig = {
  slug: "about-page",
  label: "About page",
  admin: { group: "Content", description: "Copy for /about and /about/leadership. The layout stays in code." },
  hooks: { afterChange: revalidateGlobal("pages", "staff") },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "About",
          fields: [
            { name: "lead", type: "textarea", required: true },
            {
              name: "story",
              type: "group",
              fields: [
                { type: "row", fields: [{ name: "eyebrow", type: "text", required: true }, { name: "heading", type: "text", required: true }] },
                textList("paragraphs", "Paragraphs"),
                imageField("photos", { hasMany: true, maxRows: 3, admin: { description: "Three photos; the first is the large one." } } as never),
              ],
            },
            {
              name: "milestones",
              type: "array",
              fields: [{ type: "row", fields: [{ name: "year", type: "text", required: true, admin: { width: "120px" } }, { name: "text", type: "text", required: true }] }],
            },
            iconCards("facts", "Facts"),
          ],
        },
        {
          label: "Leadership page",
          fields: [
            {
              name: "teamCounts",
              label: "Care team counts",
              type: "array",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "count", type: "number", required: true, admin: { width: "120px" } },
                    { name: "role", type: "text", required: true },
                    { name: "note", type: "text", required: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const VisionPage: GlobalConfig = {
  slug: "vision-page",
  label: "Vision & values page",
  admin: { group: "Content" },
  hooks: { afterChange: revalidateGlobal("pages") },
  fields: [
    { name: "lead", type: "textarea", required: true },
    { name: "vision", type: "textarea", required: true },
    { name: "mission", type: "textarea", required: true },
    iconCards("values", "Values"),
    { name: "rightsNote", label: "Patient rights note", type: "textarea", required: true },
  ],
};

export const PatientsPage: GlobalConfig = {
  slug: "patients-page",
  label: "Patients & visitors page",
  admin: { group: "Content", description: numbersNote },
  hooks: { afterChange: revalidateGlobal("pages") },
  fields: [
    { name: "lead", type: "textarea", required: true },
    { name: "bringIntro", label: "What to bring — intro", type: "textarea", required: true },
    {
      name: "checklists",
      type: "array",
      fields: [iconField("icon", { required: true }), { name: "title", type: "text", required: true }, textList("items", "Items")],
    },
    { name: "stepsIntro", label: "Your visit — intro", type: "textarea", required: true },
    {
      name: "steps",
      type: "array",
      fields: [{ name: "title", type: "text", required: true }, { name: "text", type: "textarea", required: true }],
    },
    textList("billing", "Billing paragraphs"),
    { name: "billingNote", type: "textarea", required: true },
  ],
};

export const CareersPage: GlobalConfig = {
  slug: "careers-page",
  label: "Careers page",
  admin: { group: "Content", description: "Copy for /careers. Postings are under Content → Careers." },
  hooks: { afterChange: revalidateGlobal("jobs") },
  fields: [textList("benefits", "Why work at DCH")],
};

const legalTab = (name: "privacy" | "patientRights", label: string) => ({
  label,
  fields: [
    {
      name,
      type: "group" as const,
      label: false as const,
      fields: [
        { name: "intro", type: "textarea" as const, required: true },
        { name: "body", type: "richText" as const, required: true },
        {
          name: "lastUpdated",
          type: "date" as const,
          required: true,
          admin: { date: { pickerAppearance: "dayOnly" as const }, description: "Shown on the page. Update it when the text changes." },
        },
      ],
    },
  ],
});

export const LegalPages: GlobalConfig = {
  slug: "legal-pages",
  label: "Privacy & patient rights",
  admin: {
    group: "Settings",
    description:
      "Copy for /privacy and /patient-rights. The starter text is a draft — have the Data Protection Officer and management review it before launch. Use {email}, {trunkline} or {emergencyNumber} to insert values from Website settings.",
  },
  hooks: { afterChange: revalidateGlobal("legal") },
  fields: [{ type: "tabs", tabs: [legalTab("privacy", "Privacy notice"), legalTab("patientRights", "Patient rights")] }],
};

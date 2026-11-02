import type { CollectionConfig } from "payload";
import { doctorGroups } from "@/content/people";
import { iconField, imageField, slugField, sortField } from "../fields";
import { revalidateCollection } from "../revalidate";

/** Directory filter chips, in display order. */
export const DOCTOR_GROUPS = doctorGroups;

/** Half-hour clinic boundaries, 6:00 AM – 8:00 PM, stored as "HH:MM" (24h). */
const TIME_OPTIONS = Array.from({ length: 29 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
  const h = Math.floor(minutes / 60);
  const label = `${h % 12 || 12}:${minutes % 60 ? "30" : "00"} ${h >= 12 ? "PM" : "AM"}`;
  return { label, value };
});

export const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, i) => ({ label, value: String(i) }));

export const Doctors: CollectionConfig = {
  slug: "doctors",
  labels: { singular: "Doctor", plural: "Doctors directory" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "specialty", "group", "days", "active"],
    description: "The public doctors directory. Leadership and department heads are under Staff.",
  },
  defaultSort: "sort",
  hooks: revalidateCollection("doctors"),
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "initials", type: "text", required: true, maxLength: 3, admin: { width: "120px" } },
      ],
    },
    imageField("photo"),
    { name: "specialty", type: "text", required: true, admin: { description: 'e.g. "Internal Medicine · Adult Cardiology".' } },
    {
      type: "row",
      fields: [
        {
          name: "group",
          label: "Directory filter",
          type: "select",
          required: true,
          options: DOCTOR_GROUPS.map((g) => ({ label: g, value: g })),
        },
        {
          name: "service",
          label: "Department",
          type: "relationship",
          relationTo: "services",
          admin: { description: 'Listed under "Doctors" on this department\'s page.' },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "days", label: "Clinic days", type: "select", hasMany: true, options: DAY_OPTIONS },
        { name: "hours", type: "text", required: true, admin: { description: 'e.g. "9:00 AM – 12:00 NN".' } },
      ],
    },
    {
      name: "booking",
      label: "Online booking",
      type: "group",
      admin: {
        description:
          "Clinic start and end times for online appointment requests (20-minute slots on the clinic days above; 12–1 PM is skipped for all-day clinics). Leave empty if this doctor cannot be booked online.",
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "from", label: "Clinic starts", type: "select", options: TIME_OPTIONS },
            {
              name: "to",
              label: "Clinic ends",
              type: "select",
              options: TIME_OPTIONS,
              validate: (value: unknown, { siblingData }: { siblingData?: { from?: string | null } }) => {
                const from = siblingData?.from;
                if (!from && !value) return true;
                if (!from || !value) return "Set both times, or neither.";
                return String(value) > from || "Must be after the start time.";
              },
            },
          ],
        },
      ],
    },
    { name: "active", type: "checkbox", defaultValue: true, admin: { position: "sidebar", description: "Untick to hide from the directory." } },
    slugField("name"),
    sortField,
  ],
};

export const StaffMembers: CollectionConfig = {
  slug: "staff-members",
  labels: { singular: "Staff member", plural: "Staff" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "title", "group", "section"],
    description: "Leadership and department heads on the About → Leadership page.",
  },
  defaultSort: "sort",
  hooks: revalidateCollection("staff"),
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "initials", type: "text", required: true, maxLength: 3, admin: { width: "120px" } },
      ],
    },
    imageField("photo"),
    { name: "title", type: "text", required: true },
    {
      name: "group",
      type: "select",
      required: true,
      options: [
        { label: "Medical director", value: "director" },
        { label: "Leadership", value: "leadership" },
        { label: "Department head", value: "department-head" },
      ],
    },
    {
      type: "row",
      admin: { condition: (data) => data?.group === "department-head" },
      fields: [{ name: "section", type: "text", admin: { description: 'e.g. "Emergency room".' } }, iconField("icon")],
    },
    { name: "bio", type: "textarea" },
    sortField,
  ],
};

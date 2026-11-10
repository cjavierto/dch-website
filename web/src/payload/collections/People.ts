import type { CollectionConfig } from "payload";
import { doctorGroups } from "@/content/people";
import { BOOKING_ENABLED } from "@/lib/features";
import { formatTime, WEEKDAYS } from "@/lib/schedule";
import { iconField, imageField, slugField, sortField } from "../fields";
import { revalidateCollection } from "../revalidate";

/** Directory filter chips, in display order. */
export const DOCTOR_GROUPS = doctorGroups;

/** Half-hour clinic boundaries, 6:00 AM – 9:00 PM, stored as "HH:MM" (24h). */
const TIME_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
  return { label: formatTime(value), value };
});

export const DAY_OPTIONS = WEEKDAYS.map((d, i) => ({ label: d.full, value: String(i) }));

export const Doctors: CollectionConfig = {
  slug: "doctors",
  labels: { singular: "Doctor", plural: "Doctors directory" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "specialty", "group", "active"],
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
      name: "schedule",
      label: "Clinic schedule",
      labels: { singular: "Clinic session", plural: "Clinic sessions" },
      type: "array",
      admin: {
        description:
          "One row per clinic session. Add two rows for the same day for a morning and an afternoon clinic. Leave the times empty when hours vary (on call, by OR schedule).",
        components: { RowLabel: "@/payload/admin/ClinicSessionLabel#ClinicSessionLabel" },
        initCollapsed: true,
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "day", type: "select", required: true, options: DAY_OPTIONS, admin: { width: "34%" } },
            { name: "from", label: "Starts", type: "select", options: TIME_OPTIONS, admin: { width: "33%" } },
            {
              name: "to",
              label: "Ends",
              type: "select",
              options: TIME_OPTIONS,
              admin: { width: "33%" },
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
    {
      name: "scheduleNote",
      label: "Schedule note",
      type: "text",
      admin: { description: 'Optional, shown with the schedule, e.g. "On call" or "By OR schedule".' },
    },
    {
      name: "bookable",
      label: "Accept online booking requests",
      type: "checkbox",
      defaultValue: false,
      admin: {
        hidden: !BOOKING_ENABLED,
        description: "Patients can request 20-minute slots in the timed clinic sessions above (12–1 PM is skipped for all-day clinics).",
      },
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

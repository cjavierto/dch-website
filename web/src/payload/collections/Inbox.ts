import type { CollectionConfig } from "payload";
import { CONTACT_SUBJECTS } from "@/lib/contact";
import { APPOINTMENT_STATUSES } from "@/lib/appointments";
import { emailPatientWhenHospitalCancels } from "@/lib/appointmentEmails";

const signedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

/** Submissions are created by the public site's server actions (Local API). */
export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  labels: { singular: "Contact entry", plural: "Contact us entries" },
  admin: {
    group: "Inbox",
    useAsTitle: "name",
    defaultColumns: ["name", "subject", "mobile", "status", "createdAt"],
    listSearchableFields: ["name", "mobile", "email", "message"],
  },
  defaultSort: "-createdAt",
  access: { create: signedIn, read: signedIn, update: signedIn, delete: signedIn },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { readOnly: true } },
        { name: "mobile", type: "text", required: true, admin: { readOnly: true } },
        { name: "email", type: "email", admin: { readOnly: true } },
      ],
    },
    {
      name: "subject",
      type: "select",
      required: true,
      options: CONTACT_SUBJECTS.map((s) => ({ label: s.label, value: s.value })),
      admin: { readOnly: true },
    },
    { name: "message", type: "textarea", required: true, admin: { readOnly: true } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Replied", value: "replied" },
        { label: "Closed", value: "closed" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "notes", label: "Internal notes", type: "textarea", admin: { position: "sidebar" } },
  ],
};

export const JobApplications: CollectionConfig = {
  slug: "job-applications",
  labels: { singular: "Job application", plural: "Job applications" },
  admin: {
    group: "Inbox",
    useAsTitle: "name",
    defaultColumns: ["name", "job", "contact", "status", "createdAt"],
  },
  defaultSort: "-createdAt",
  access: { create: signedIn, read: signedIn, update: signedIn, delete: signedIn },
  fields: [
    { name: "job", type: "relationship", relationTo: "job-postings", required: true, admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { readOnly: true } },
        { name: "contact", label: "Email or mobile", type: "text", required: true, admin: { readOnly: true } },
        { name: "prcLicence", label: "PRC licence no.", type: "text", admin: { readOnly: true } },
      ],
    },
    { name: "cv", label: "CV", type: "upload", relationTo: "applicant-files", required: true, admin: { readOnly: true } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Shortlisted", value: "shortlisted" },
        { label: "Interviewed", value: "interviewed" },
        { label: "Closed", value: "closed" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "notes", label: "Internal notes", type: "textarea", admin: { position: "sidebar" } },
  ],
};

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Admin user", plural: "Admin users" },
  auth: true,
  admin: { group: "Settings", useAsTitle: "name", defaultColumns: ["name", "email", "role"] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", admin: { description: 'Shown under your name, e.g. "Administrator".' } },
  ],
};

/** Appointments from the public booking pages. /book-appointment books a
    slot straight away (status Confirmed) and emails the patient a link to
    reschedule or cancel; the older /book page saves a Requested entry for
    staff to confirm by SMS. */
export const BookingRequests: CollectionConfig = {
  slug: "booking-requests",
  labels: { singular: "Appointment", plural: "Appointments" },
  admin: {
    group: "Inbox",
    useAsTitle: "name",
    defaultColumns: ["date", "time", "name", "doctor", "status"],
    listSearchableFields: ["name", "mobile", "email", "reason"],
    description:
      "Booked online. Patients get an email with a link to reschedule or cancel. Setting the status to Cancelled emails the patient and frees the slot.",
  },
  defaultSort: "-date",
  access: { create: signedIn, read: signedIn, update: signedIn, delete: signedIn },
  hooks: { afterChange: [emailPatientWhenHospitalCancels] },
  fields: [
    {
      type: "row",
      fields: [
        { name: "doctor", type: "relationship", relationTo: "doctors", required: true, admin: { readOnly: true } },
        { name: "department", type: "text", required: true, admin: { readOnly: true } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "date", type: "text", required: true, index: true, admin: { readOnly: true, description: "YYYY-MM-DD" } },
        { name: "time", type: "text", required: true, admin: { readOnly: true, description: "24-hour HH:MM" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { readOnly: true } },
        { name: "mobile", type: "text", required: true, admin: { readOnly: true } },
        { name: "email", type: "email", admin: { readOnly: true } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "firstVisit",
          label: "First visit",
          type: "select",
          required: true,
          options: [
            { label: "Yes, first time at DCH", value: "yes" },
            { label: "No, has a patient record", value: "no" },
          ],
          admin: { readOnly: true },
        },
        { name: "philhealth", label: "PhilHealth number", type: "text", admin: { readOnly: true } },
      ],
    },
    { name: "reason", label: "Reason for visit", type: "textarea", required: true, admin: { readOnly: true } },
    {
      name: "history",
      type: "textarea",
      admin: { readOnly: true, description: "Booked, rescheduled and cancelled by the patient." },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "requested",
      options: [...APPOINTMENT_STATUSES],
      admin: { position: "sidebar", description: "Cancelled and declined appointments free the slot again." },
    },
    { name: "notes", label: "Internal notes", type: "textarea", admin: { position: "sidebar" } },
    { name: "manageToken", type: "text", index: true, admin: { hidden: true } },
  ],
};

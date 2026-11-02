/**
 * Contact form rules, shared by the browser (inline errors) and the server
 * action (the authority). No server-only imports here.
 */

export const CONTACT_SUBJECTS = [
  { value: "appointment", label: "Appointment request" },
  { value: "billing", label: "Billing & PhilHealth" },
  { value: "records", label: "Medical records" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"];

export const DEFAULT_SUBJECT: ContactSubject = "appointment";

export function isContactSubject(v: unknown): v is ContactSubject {
  return CONTACT_SUBJECTS.some((s) => s.value === v);
}

export type ContactValues = {
  name: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactField = keyof ContactValues;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const MESSAGE_MAX = 2000;

/** Philippine mobile: 09XX XXX XXXX or +63 9XX XXX XXXX (spaces, dashes,
    dots and brackets allowed). Returns the number as 09XXXXXXXXX, or null. */
export function normalizePhMobile(input: string): string | null {
  const compact = input.replace(/[\s\-.()]/g, "");
  const m = /^(?:\+?63|0)(9\d{9})$/.exec(compact);
  return m ? `0${m[1]}` : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(v: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = v.name.trim();
  if (!name) errors.name = "Enter your full name.";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";

  if (!v.mobile.trim()) errors.mobile = "Enter a mobile number so we can text you back.";
  else if (!normalizePhMobile(v.mobile))
    errors.mobile = "Enter a Philippine mobile number, like 0917 123 4567 or +63 917 123 4567.";

  const email = v.email.trim();
  if (email && !EMAIL.test(email)) errors.email = "Check the email address, or leave it blank.";

  if (!isContactSubject(v.subject)) errors.subject = "Choose a subject.";

  const message = v.message.trim();
  if (!message) errors.message = "Tell us what you need.";
  else if (message.length > MESSAGE_MAX)
    errors.message = `Keep your message under ${MESSAGE_MAX.toLocaleString("en-US")} characters.`;

  return errors;
}

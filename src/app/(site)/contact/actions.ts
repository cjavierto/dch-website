"use server";

import {
  normalizePhMobile,
  validateContact,
  type ContactErrors,
  type ContactSubject,
  type ContactValues,
} from "@/lib/contact";
import { saveContactSubmission } from "@/lib/cms";

export type ContactFormState =
  | { status: "idle" }
  | { status: "invalid"; errors: ContactErrors }
  | { status: "error" }
  | { status: "sent" };

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: real people never see or fill this field. Pretend it worked so
  // bots get no signal.
  if (String(formData.get("website") ?? "").trim()) return { status: "sent" };

  const values: ContactValues = {
    name: String(formData.get("name") ?? ""),
    mobile: String(formData.get("mobile") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  try {
    await saveContactSubmission({
      name: values.name.trim(),
      mobile: normalizePhMobile(values.mobile)!,
      email: values.email.trim() || null,
      subject: values.subject as ContactSubject,
      message: values.message.trim(),
    });
  } catch (err) {
    console.error("Contact submission failed", err);
    return { status: "error" };
  }
  return { status: "sent" };
}

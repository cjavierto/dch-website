/**
 * Job application rules, shared by the browser and the server action.
 */
import { normalizePhMobile } from "@/lib/contact";

export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};
export const CV_ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type ApplicationValues = {
  name: string;
  contact: string;
  prc: string;
  cv: { name: string; type: string; size: number } | null;
};

export type ApplicationField = keyof ApplicationValues;
export type ApplicationErrors = Partial<Record<ApplicationField, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cvTypeOk(cv: { name: string; type: string }) {
  if (CV_TYPES[cv.type]) return true;
  // Some browsers send an empty type; fall back to the extension.
  return !cv.type && /\.(pdf|docx)$/i.test(cv.name);
}

export function validateApplication(v: ApplicationValues, licensed: boolean): ApplicationErrors {
  const errors: ApplicationErrors = {};
  const name = v.name.trim();
  if (!name) errors.name = "Enter your full name.";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";

  const contact = v.contact.trim();
  if (!contact) errors.contact = "Enter an email address or mobile number.";
  else if (!EMAIL.test(contact) && !normalizePhMobile(contact))
    errors.contact = "Enter a valid email, or a mobile number like 0917 123 4567.";

  if (licensed) {
    const prc = v.prc.replace(/\s/g, "");
    if (!prc) errors.prc = "Enter your PRC licence number.";
    else if (!/^\d{5,8}$/.test(prc)) errors.prc = "Enter the licence number as shown on your PRC ID (digits only).";
  }

  if (!v.cv || v.cv.size === 0) errors.cv = "Attach your CV.";
  else if (!cvTypeOk(v.cv)) errors.cv = "Attach your CV as a PDF or DOCX file.";
  else if (v.cv.size > CV_MAX_BYTES) errors.cv = "Your CV must be 5 MB or smaller.";

  return errors;
}

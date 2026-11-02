"use client";

import { useSearchParams } from "next/navigation";
import { DEFAULT_SUBJECT, isContactSubject } from "@/lib/contact";
import { ContactForm } from "./ContactForm";

/** Presets the subject from `?subject=` (e.g. every "Book Appointment" CTA
    links to /contact?subject=appointment). Must sit inside <Suspense>. */
export function ContactFormWithQuery({ emergencyNumber }: { emergencyNumber: string }) {
  const param = useSearchParams().get("subject");
  const subject = isContactSubject(param) ? param : DEFAULT_SUBJECT;
  return <ContactForm key={subject} initialSubject={subject} emergencyNumber={emergencyNumber} />;
}

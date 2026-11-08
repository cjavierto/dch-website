/**
 * Email notices to hospital staff when the public site saves a submission.
 * Sent through Payload's email adapter (Postmark, see src/payload/postmark.ts).
 *
 * Best effort: the submission is already saved in the admin inbox, so a mail
 * failure is logged and never shown to the visitor. CVs are not attached —
 * staff open them in the admin, which keeps personal data out of mailboxes.
 */
import type { Payload } from "payload";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/lib/contact";
import { SITE_URL } from "@/lib/site";

const escape = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

type Row = [label: string, value: string | null | undefined];

function render(title: string, rows: Row[], adminPath: string, note?: string) {
  const link = `${SITE_URL}${adminPath}`;
  const shown = rows.filter((r): r is [string, string] => Boolean(r[1]));
  const text = [
    title,
    "",
    ...shown.map(([k, v]) => `${k}: ${v}`),
    "",
    `Open in the admin: ${link}`,
    ...(note ? ["", note] : []),
  ].join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#14181f;line-height:1.5">
<h2 style="font-size:18px;color:#0e2559;margin:0 0 12px">${escape(title)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${shown
    .map(
      ([k, v]) =>
        `<tr><td style="vertical-align:top;color:#6d6a62;white-space:nowrap">${escape(k)}</td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin:18px 0"><a href="${escape(link)}" style="background:#14357f;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open in the admin</a></p>
${note ? `<p style="color:#6d6a62;font-size:13px">${escape(note)}</p>` : ""}
</div>`;
  return { text, html };
}

async function send(payload: Payload, message: { to: string; subject: string; replyTo?: string; text: string; html: string }) {
  if (!message.to) return;
  try {
    await payload.sendEmail(message);
  } catch (err) {
    payload.logger.error(`Email notice "${message.subject}" not sent: ${(err as Error).message}`);
  }
}

export async function notifyContact(
  payload: Payload,
  to: string,
  id: number | string,
  s: { name: string; mobile: string; email: string | null; subject: ContactSubject; message: string },
) {
  const subjectLabel = CONTACT_SUBJECTS.find((c) => c.value === s.subject)?.label ?? s.subject;
  const body = render(
    `New message: ${subjectLabel}`,
    [
      ["Name", s.name],
      ["Mobile", s.mobile],
      ["Email", s.email],
      ["Subject", subjectLabel],
      ["Message", s.message],
    ],
    `/admin/collections/contact-submissions/${id}`,
    s.email ? "Reply to this email to answer them directly." : "No email given: reply by text or call.",
  );
  await send(payload, { to, subject: `Website: ${subjectLabel} from ${s.name}`, replyTo: s.email ?? undefined, ...body });
}

export async function notifyJobApplication(
  payload: Payload,
  to: string,
  id: number | string,
  a: { jobTitle: string; name: string; contact: string; prcLicence: string | null },
) {
  const body = render(
    `New application: ${a.jobTitle}`,
    [
      ["Position", a.jobTitle],
      ["Name", a.name],
      ["Contact", a.contact],
      ["PRC licence", a.prcLicence],
    ],
    `/admin/collections/job-applications/${id}`,
    "The CV is attached to the application in the admin.",
  );
  await send(payload, { to, subject: `Website: application for ${a.jobTitle} from ${a.name}`, ...body });
}

export async function notifyBooking(
  payload: Payload,
  to: string,
  id: number | string,
  r: { doctorName: string; date: string; time: string; name: string; mobile: string; reason: string },
) {
  const body = render(
    `New appointment request: ${r.doctorName}`,
    [
      ["Doctor", r.doctorName],
      ["Date", r.date],
      ["Time", r.time],
      ["Patient", r.name],
      ["Mobile", r.mobile],
      ["Reason", r.reason],
    ],
    `/admin/collections/booking-requests/${id}`,
    "Confirm with the patient by text, then update the status in the admin.",
  );
  await send(payload, { to, subject: `Website: appointment request from ${r.name}`, ...body });
}

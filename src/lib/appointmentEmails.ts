/**
 * Emails for self-service appointments: the patient's confirmation (with a
 * calendar file and a reschedule/cancel link) and a notice to staff.
 *
 * Takes the Payload instance as an argument and never imports the CMS
 * helpers, because the Appointments collection uses it in a hook and the
 * config can't import itself.
 */
import type { CollectionAfterChangeHook, Payload } from "payload";
import { ACTIVE_STATUSES, googleCalendarUrl, icsFile, shortDate, type AppointmentStatus, type CalendarEvent } from "@/lib/appointments";
import { formatBookingDate, formatTime } from "@/lib/booking";
import { escape, recipients, render, send } from "@/lib/notify";
import { SITE_URL } from "@/lib/site";
import { telHref } from "@/lib/format";

export type AppointmentView = {
  id: number;
  token: string;
  status: AppointmentStatus;
  doctorSlug: string;
  doctorName: string;
  specialty: string;
  day: string;
  time: string;
  name: string;
  mobile: string;
  email: string | null;
  reason: string;
};

export type HospitalInfo = {
  name: string;
  location: string;
  trunkline: string;
  emergencyNumber: string;
  email: string;
  /** Staff who get appointment notices. */
  staff: string[];
};

export async function hospitalInfo(payload: Payload): Promise<HospitalInfo> {
  const s = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const a = s.address;
  return {
    name: s.hospitalName,
    location: `${s.hospitalName}, Outpatient Department, ${a.street}, ${a.barangay}, ${a.town}, ${a.province}`,
    trunkline: s.trunkline,
    emergencyNumber: s.emergencyNumber,
    email: s.email,
    staff: recipients(s.email, s.notifications?.appointmentRecipients),
  };
}

export const manageUrl = (token: string) => `${SITE_URL}/book-appointment/manage/${token}`;
export const rebookUrl = (doctorSlug: string) => `${SITE_URL}/book-appointment?doctor=${encodeURIComponent(doctorSlug)}`;

export function calendarEvent(a: AppointmentView, h: HospitalInfo): CalendarEvent & { uid: string } {
  return {
    uid: `appointment-${a.id}@${new URL(SITE_URL).hostname}`,
    day: a.day,
    time: a.time,
    title: `Appointment with ${a.doctorName}`,
    details: `${a.specialty} at ${h.name}.\nPlease arrive a few minutes early to register at the OPD.\nReschedule or cancel: ${manageUrl(a.token)}`,
    location: h.location,
  };
}

const when = (a: Pick<AppointmentView, "day" | "time">) => `${formatBookingDate(a.day)} at ${formatTime(a.time)}`;

type PatientEmail = "booked" | "rescheduled" | "cancelled" | "cancelledByHospital";

const button = (href: string, label: string, primary = true) =>
  `<a href="${escape(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:bold;${
    primary ? "background:#14357f;color:#ffffff" : "background:#ffffff;color:#14357f;border:1px solid #c9cfdb"
  }">${escape(label)}</a>`;

export async function emailPatient(payload: Payload, kind: PatientEmail, a: AppointmentView, h: HospitalInfo, previous?: Pick<AppointmentView, "day" | "time">) {
  if (!a.email) return;
  const first = a.name.trim().split(/\s+/)[0];
  const event = calendarEvent(a, h);
  const cancelled = kind === "cancelled" || kind === "cancelledByHospital";

  const title = {
    booked: "Your appointment is booked",
    rescheduled: "Your appointment has been moved",
    cancelled: "Your appointment is cancelled",
    cancelledByHospital: "We had to cancel your appointment",
  }[kind];
  const subject = {
    booked: `Appointment confirmed: ${a.doctorName}, ${shortDate(a.day)} at ${formatTime(a.time)}`,
    rescheduled: `Appointment moved: ${a.doctorName}, ${shortDate(a.day)} at ${formatTime(a.time)}`,
    cancelled: `Appointment cancelled: ${a.doctorName}, ${shortDate(a.day)}`,
    cancelledByHospital: `Your appointment on ${shortDate(a.day)} was cancelled`,
  }[kind];
  const intro = {
    booked: `Hi ${first}, you're booked. Here are the details.`,
    rescheduled: `Hi ${first}, your appointment is now at the new time below.`,
    cancelled: `Hi ${first}, your appointment below is cancelled. You can book another time whenever you're ready.`,
    cancelledByHospital: `Hi ${first}, we're sorry: the hospital had to cancel your appointment below. Please book another time, or call us at ${h.trunkline}.`,
  }[kind];

  const rows: [string, string][] = [
    ["Doctor", `${a.doctorName} (${a.specialty})`],
    ["When", when(a)],
    ...(previous ? ([["Was", when(previous)]] as [string, string][]) : []),
    ["Where", h.location],
    ["Patient", a.name],
  ];

  const buttons = cancelled
    ? button(rebookUrl(a.doctorSlug), "Book another time")
    : button(manageUrl(a.token), "Reschedule or cancel") + button(googleCalendarUrl(event), "Add to Google Calendar", false);

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#14181f;line-height:1.55;max-width:560px">
<h2 style="font-size:20px;color:#0e2559;margin:0 0 8px">${escape(title)}</h2>
<p style="margin:0 0 16px">${escape(intro)}</p>
<table cellpadding="7" style="border-collapse:collapse;background:#f2f5fa;border-radius:10px;width:100%">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="vertical-align:top;color:#6d6a62;white-space:nowrap;width:80px">${escape(k)}</td><td style="${
          k === "Was" ? "text-decoration:line-through;color:#6d6a62" : "font-weight:bold"
        }">${escape(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin:18px 0 6px">${buttons}</p>
${cancelled ? "" : `<p style="margin:0 0 6px;color:#3d3a34">Please arrive a few minutes early to register at the OPD.${
    kind === "booked" ? " A calendar file is attached if you use Apple Calendar or Outlook." : ""
  }</p>`}
<p style="margin:18px 0 0;color:#6d6a62;font-size:13px">Questions? Reply to this email or call ${escape(h.trunkline)}.
This is not for emergencies: for urgent care call <a href="${escape(telHref(h.emergencyNumber))}" style="color:#b3261e">${escape(h.emergencyNumber)}</a> or come to the Emergency Room (open 24 hours).</p>
</div>`;

  const text = [
    title,
    "",
    intro,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    ...(cancelled
      ? [`Book another time: ${rebookUrl(a.doctorSlug)}`]
      : [`Reschedule or cancel: ${manageUrl(a.token)}`, `Add to Google Calendar: ${googleCalendarUrl(event)}`, "", "Please arrive a few minutes early to register at the OPD."]),
    "",
    `Questions? Reply to this email or call ${h.trunkline}. For emergencies call ${h.emergencyNumber}.`,
  ].join("\n");

  await send(payload, {
    to: [a.email],
    subject,
    replyTo: h.email,
    text,
    html,
    attachments:
      kind === "booked" || kind === "rescheduled"
        ? [{ filename: "appointment.ics", content: icsFile(event), contentType: "text/calendar; charset=utf-8; method=PUBLISH" }]
        : undefined,
  });
}

type StaffEmail = "booked" | "rescheduled" | "cancelled";

export async function emailStaff(payload: Payload, kind: StaffEmail, a: AppointmentView, h: HospitalInfo, previous?: Pick<AppointmentView, "day" | "time">) {
  const heading = { booked: "New appointment", rescheduled: "Appointment moved", cancelled: "Appointment cancelled by the patient" }[kind];
  const body = render(
    `${heading}: ${a.doctorName}`,
    [
      ["Doctor", a.doctorName],
      ["When", when(a)],
      ["Was", previous ? when(previous) : null],
      ["Patient", a.name],
      ["Mobile", a.mobile],
      ["Email", a.email],
      ["Reason", a.reason],
    ],
    `/admin/collections/booking-requests/${a.id}`,
    kind === "cancelled" ? "The slot is free again." : "Booked by the patient on the website. No confirmation call is needed.",
  );
  const verb = { booked: "booked", rescheduled: "moved", cancelled: "cancelled" }[kind];
  await send(payload, {
    to: h.staff,
    subject: `Website: ${a.name} ${verb} ${a.doctorName}, ${shortDate(a.day)} ${formatTime(a.time)}`,
    replyTo: a.email ?? undefined,
    ...body,
  });
}

/** Builds the view from a stored appointment (doctor populated or an id). */
export async function toView(payload: Payload, stored: object): Promise<AppointmentView> {
  const doc = stored as Record<string, unknown>;
  const ref = doc.doctor as number | { id: number; name: string; specialty: string; slug: string };
  const doctor =
    typeof ref === "object" ? ref : await payload.findByID({ collection: "doctors", id: ref, depth: 0, overrideAccess: true });
  return {
    id: doc.id as number,
    token: (doc.manageToken as string) ?? "",
    status: doc.status as AppointmentStatus,
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    day: doc.date as string,
    time: doc.time as string,
    name: doc.name as string,
    mobile: doc.mobile as string,
    email: (doc.email as string | null) ?? null,
    reason: doc.reason as string,
  };
}

/** Staff set an appointment to Cancelled or Declined in the admin: tell the patient. */
export const emailPatientWhenHospitalCancels: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== "update" || !req.user || !doc.email || !doc.manageToken) return doc;
  const wasActive = ACTIVE_STATUSES.includes(previousDoc?.status);
  const nowOff = doc.status === "cancelled" || doc.status === "declined";
  if (wasActive && nowOff) {
    const [view, h] = await Promise.all([toView(req.payload, doc), hospitalInfo(req.payload)]);
    await emailPatient(req.payload, "cancelledByHospital", view, h);
  }
  return doc;
};

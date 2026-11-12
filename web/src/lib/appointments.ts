/**
 * Rules for the self-service booking page (/book-appointment), shared by the
 * browser and the server. Dates are Manila calendar days ("YYYY-MM-DD"),
 * times 24-hour "HH:MM". Slot sizes and clinic sessions come from
 * lib/booking and lib/schedule.
 */
import { normalizePhMobile } from "@/lib/contact";
import { addDays, SLOT_MINUTES } from "@/lib/booking";
import { toMinutes } from "@/lib/schedule";

export const APPOINTMENT_STATUSES = [
  { label: "Requested", value: "requested" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "No-show", value: "no-show" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "declined" },
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]["value"];

/** Statuses that hold the slot. */
export const ACTIVE_STATUSES: AppointmentStatus[] = ["requested", "confirmed"];

export const REASON_MAX = 500;
/** One-tap answers for "What is the visit for?". */
export const REASON_CHOICES = ["Check-up", "Follow-up visit", "New health concern", "Lab or X-ray results", "Medical certificate"];

// ---- Patient details ------------------------------------------------------------

export type AppointmentDetails = { name: string; mobile: string; email: string; firstVisit: string; reason: string };
export type AppointmentField = keyof AppointmentDetails;
export type AppointmentErrors = Partial<Record<AppointmentField | "slot", string>>;
export const DETAIL_ORDER: AppointmentField[] = ["name", "mobile", "email", "firstVisit", "reason"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateAppointmentDetails(v: AppointmentDetails): AppointmentErrors {
  const errors: AppointmentErrors = {};
  const name = v.name.trim();
  if (!name) errors.name = "Enter the patient's full name.";
  else if (name.length > 100) errors.name = "Keep the name under 100 characters.";

  if (!v.mobile.trim()) errors.mobile = "Enter a mobile number in case we need to reach you.";
  else if (!normalizePhMobile(v.mobile)) errors.mobile = "Enter a Philippine mobile number, like 0917 123 4567.";

  const email = v.email.trim();
  if (!email) errors.email = "Enter your email. We send the confirmation there.";
  else if (!EMAIL.test(email) || email.length > 200) errors.email = "Check the email address, like juan@gmail.com.";

  if (v.firstVisit !== "yes" && v.firstVisit !== "no") errors.firstVisit = "Choose Yes or No.";

  const reason = v.reason.trim();
  if (!reason) errors.reason = "Tell us briefly what the visit is for.";
  else if (reason.length > REASON_MAX) errors.reason = `Keep it under ${REASON_MAX} characters.`;

  return errors;
}

// ---- Closed dates ------------------------------------------------------------------

/** A day or range nobody can book (doctor's leave, clinic holiday). Inclusive. */
export type ClosedRange = { from: string; to: string };

/** A CMS date (ISO timestamp) as a Manila calendar day. */
export function manilaDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

export function toClosedRanges(rows: { from?: string | null; to?: string | null }[] | null | undefined): ClosedRange[] {
  return (rows ?? [])
    .filter((r): r is { from: string; to?: string | null } => Boolean(r.from))
    .map((r) => {
      const from = manilaDay(r.from);
      const to = r.to ? manilaDay(r.to) : from;
      return { from, to: to < from ? from : to };
    });
}

export const isClosedOn = (day: string, ranges: ClosedRange[]) => ranges.some((r) => day >= r.from && day <= r.to);

// ---- Times -------------------------------------------------------------------------

export const slotEnd = (time: string) => {
  const m = toMinutes(time) + SLOT_MINUTES;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Manila wall time → UTC instant (Manila has no daylight saving: UTC+8). */
export function manilaInstant(day: string, time: string) {
  return new Date(`${day}T${time}:00+08:00`);
}

/** 20261113T012000Z — the format calendars use. */
const calStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export type CalendarEvent = { day: string; time: string; title: string; details: string; location: string; uid?: string };

export function googleCalendarUrl(e: CalendarEvent) {
  const start = manilaInstant(e.day, e.time);
  const end = manilaInstant(e.day, slotEnd(e.time));
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${calStamp(start)}/${calStamp(end)}`,
    details: e.details,
    location: e.location,
    ctz: "Asia/Manila",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** iCalendar file for Apple Calendar, Outlook and most phones. */
export function icsFile(e: CalendarEvent & { uid: string; cancelled?: boolean }) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
  const start = manilaInstant(e.day, e.time);
  const end = manilaInstant(e.day, slotEnd(e.time));
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Deiparine Community Hospital//Appointments//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${e.cancelled ? "CANCEL" : "PUBLISH"}`,
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${calStamp(new Date())}`,
    `DTSTART:${calStamp(start)}`,
    `DTEND:${calStamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.details)}`,
    `LOCATION:${esc(e.location)}`,
    `STATUS:${e.cancelled ? "CANCELLED" : "CONFIRMED"}`,
    ...(e.cancelled
      ? []
      : ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Appointment tomorrow", "TRIGGER:-P1D", "END:VALARM"]),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

// ---- Calendar months -----------------------------------------------------------------

/** "2026-11" → every day of that month. */
export function monthDays(month: string) {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

export const shiftMonth = (month: string, n: number) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
};

/** Days in the booking window, tomorrow onwards. */
export function windowDays(today: string, length: number) {
  return Array.from({ length }, (_, i) => addDays(today, i + 1));
}

/** "Thu, Nov 13" */
export function shortDate(day: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

/**
 * Booking rules shared by the picker (browser) and the server action.
 * Dates are Manila calendar days ("YYYY-MM-DD"); times are 24-hour "HH:MM".
 */
import type { IconName } from "@/components/Icon";
import { normalizePhMobile } from "@/lib/contact";
import { isTimed, sessionsOn, toMinutes } from "@/lib/schedule";
import type { Doctor } from "@/lib/types";

export { formatTime } from "@/lib/schedule";

export const SLOT_MINUTES = 20;
/** How far ahead patients can request a slot. */
export const BOOKING_WINDOW_DAYS = 60;
export const REASON_MAX = 1000;

/** Booking departments follow the doctors directory groups. */
export const DEPARTMENT_ICONS: Record<string, IconName> = {
  "Internal Medicine": "cardiology",
  "OB-Gynecology": "pregnant_woman",
  Pediatrics: "child_care",
  Surgery: "surgical",
  Diagnostics: "radiology",
  "Family & emergency medicine": "stethoscope",
};

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type BookableDoctor = Doctor & { bookable: true };

/** Ticked for online booking and has at least one timed clinic session. */
export const isBookable = (d: Doctor): d is BookableDoctor => d.bookable && d.schedule.some(isTimed);

// ---- Dates -------------------------------------------------------------------

/** Today in Manila as "YYYY-MM-DD". */
export function manilaToday(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

/** "2026-10-21" + n days → "YYYY-MM-DD". Calendar arithmetic in UTC. */
export function addDays(day: string, n: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Weekday with 0 = Monday … 6 = Sunday, matching Doctor.days. */
export function weekdayIndex(day: string) {
  return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
}

/** A date the doctor can be booked on: tomorrow onwards, within the window,
    on a day with a timed clinic session. */
export function isBookableDate(doctor: Pick<Doctor, "schedule">, day: string, today = manilaToday()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const first = addDays(today, 1);
  const last = addDays(today, BOOKING_WINDOW_DAYS);
  return day >= first && day <= last && sessionsOn(doctor.schedule, weekdayIndex(day)).some(isTimed);
}

/** "2026-10-21" → "Wednesday, October 21, 2026" */
export function formatBookingDate(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

// ---- Slots -------------------------------------------------------------------

const fromMinutes = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** 20-minute slot start times in the doctor's clinic sessions on that date
    ("YYYY-MM-DD"). All-day sessions skip the 12–1 PM lunch hour. */
export function clinicSlots(doctor: Pick<Doctor, "schedule">, day: string) {
  const slots = new Set<string>();
  for (const s of sessionsOn(doctor.schedule, weekdayIndex(day)).filter(isTimed)) {
    const start = toMinutes(s.from);
    const end = toMinutes(s.to);
    const allDay = start < 12 * 60 && end > 13 * 60;
    for (let m = start; m + SLOT_MINUTES <= end; m += SLOT_MINUTES) {
      if (allDay && m >= 12 * 60 && m < 13 * 60) continue;
      slots.add(fromMinutes(m));
    }
  }
  return [...slots].sort();
}

// ---- Patient details -----------------------------------------------------------

export type BookingDetails = { name: string; mobile: string; philhealth: string; firstVisit: string; reason: string };
export type BookingField = keyof BookingDetails | "slot";
export type BookingErrors = Partial<Record<BookingField, string>>;

export function validateBookingDetails(v: BookingDetails): BookingErrors {
  const errors: BookingErrors = {};
  const name = v.name.trim();
  if (!name) errors.name = "Enter the patient's full name.";
  else if (name.length > 100) errors.name = "Keep the name under 100 characters.";

  if (!v.mobile.trim()) errors.mobile = "Enter a mobile number so OPD can text you to confirm.";
  else if (!normalizePhMobile(v.mobile))
    errors.mobile = "Enter a Philippine mobile number, like 0917 123 4567 or +63 917 123 4567.";

  const pin = v.philhealth.replace(/[\s-]/g, "");
  if (pin && !/^\d{12}$/.test(pin)) errors.philhealth = "A PhilHealth number has 12 digits, like 00-000000000-0. Or leave it blank.";

  if (v.firstVisit !== "yes" && v.firstVisit !== "no") errors.firstVisit = "Tell us whether this is your first visit.";

  const reason = v.reason.trim();
  if (!reason) errors.reason = "Tell us the reason for the visit.";
  else if (reason.length > REASON_MAX) errors.reason = `Keep it under ${REASON_MAX.toLocaleString("en-US")} characters.`;

  return errors;
}

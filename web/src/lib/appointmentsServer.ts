/**
 * Server side of /book-appointment: which slots are free, booking,
 * rescheduling and cancelling. Appointments are stored in the
 * "booking-requests" collection (admin: Inbox → Appointments).
 *
 * A slot is free when it is in the doctor's timed clinic sessions, from
 * tomorrow up to BOOKING_WINDOW_DAYS ahead, not on a clinic closure or the
 * doctor's day off, and not held by a Requested or Confirmed appointment.
 */
import { randomBytes } from "node:crypto";
import config from "@payload-config";
import { getPayload, type Where } from "payload";
import {
  ACTIVE_STATUSES,
  isClosedOn,
  manilaInstant,
  monthDays,
  shortDate,
  windowDays,
  type AppointmentDetails,
} from "@/lib/appointments";
import { emailPatient, emailStaff, hospitalInfo, toView, type AppointmentView } from "@/lib/appointmentEmails";
import {
  BOOKING_WINDOW_DAYS,
  clinicSlots,
  formatTime,
  isBookable,
  isBookableDate,
  manilaToday,
  type BookableDoctor,
} from "@/lib/booking";
import { getDoctors, getSiteSettings } from "@/lib/cms";
import { normalizePhMobile } from "@/lib/contact";
import type { ClosedRange } from "@/lib/appointments";

const payload = () => getPayload({ config });

export async function bookableDoctors() {
  const { doctors, groups } = await getDoctors();
  const list = doctors.filter(isBookable);
  return { doctors: list, groups: groups.filter((g) => list.some((d) => d.group === g)) };
}

async function findBookable(slug: string) {
  const { doctors } = await bookableDoctors();
  return doctors.find((d) => d.slug === slug) ?? null;
}

async function doctorIds(slugs: string[]) {
  const { docs } = await (await payload()).find({
    collection: "doctors",
    where: { slug: { in: slugs } },
    limit: slugs.length || 1,
    depth: 0,
    pagination: false,
    select: { slug: true },
  });
  return new Map(docs.map((d) => [d.slug, d.id]));
}

/** Held times keyed "doctorId|day". */
async function heldSlots(days: string[], doctors?: number[]) {
  const where: Where[] = [{ date: { in: days } }, { status: { in: ACTIVE_STATUSES } }];
  if (doctors) where.push({ doctor: { in: doctors } });
  const { docs } = await (await payload()).find({
    collection: "booking-requests",
    where: { and: where },
    pagination: false,
    depth: 0,
    select: { doctor: true, date: true, time: true },
  });
  const held = new Map<string, Set<string>>();
  for (const d of docs) {
    const key = `${typeof d.doctor === "object" ? d.doctor.id : d.doctor}|${d.date}`;
    if (!held.has(key)) held.set(key, new Set());
    held.get(key)!.add(d.time);
  }
  return held;
}

function openSlots(doctor: BookableDoctor, day: string, closures: ClosedRange[], held: Set<string> | undefined, today: string) {
  if (!isBookableDate(doctor, day, today) || isClosedOn(day, closures) || isClosedOn(day, doctor.daysOff)) return [];
  return clinicSlots(doctor, day).filter((t) => !held?.has(t));
}

/** Free-slot count for each bookable day of the month ("YYYY-MM"). */
export async function monthAvailability(slug: string, month: string): Promise<Record<string, number>> {
  const doctor = await findBookable(slug);
  if (!doctor || !/^\d{4}-\d{2}$/.test(month)) return {};
  const today = manilaToday();
  const days = monthDays(month).filter((d) => isBookableDate(doctor, d, today));
  if (!days.length) return {};
  const [{ clinicClosures }, ids] = await Promise.all([getSiteSettings(), doctorIds([slug])]);
  const id = ids.get(slug)!;
  const held = await heldSlots(days, [id]);
  const out: Record<string, number> = {};
  for (const day of days) {
    const n = openSlots(doctor, day, clinicClosures, held.get(`${id}|${day}`), today).length;
    if (n) out[day] = n;
  }
  return out;
}

export async function daySlots(slug: string, day: string) {
  const doctor = await findBookable(slug);
  if (!doctor) return [];
  const [{ clinicClosures }, ids] = await Promise.all([getSiteSettings(), doctorIds([slug])]);
  const id = ids.get(slug)!;
  const held = await heldSlots([day], [id]);
  return openSlots(doctor, day, clinicClosures, held.get(`${id}|${day}`), manilaToday());
}

/** First day with a free slot, per doctor slug (null: none in the window). */
export async function nextAvailable(): Promise<Record<string, string | null>> {
  const { doctors } = await bookableDoctors();
  if (!doctors.length) return {};
  const today = manilaToday();
  const days = windowDays(today, BOOKING_WINDOW_DAYS);
  const [{ clinicClosures }, ids, held] = await Promise.all([getSiteSettings(), doctorIds(doctors.map((d) => d.slug)), heldSlots(days)]);
  const out: Record<string, string | null> = {};
  for (const d of doctors) {
    const id = ids.get(d.slug);
    out[d.slug] = days.find((day) => openSlots(d, day, clinicClosures, held.get(`${id}|${day}`), today).length > 0) ?? null;
  }
  return out;
}

// ---- Booking -------------------------------------------------------------------------

const stamp = () =>
  new Date().toLocaleString("en-US", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const historyLine = (prev: unknown, line: string) => [prev, `${stamp()}: ${line}`].filter(Boolean).join("\n");

export type BookResult = { ok: true; appointment: AppointmentView } | { ok: false; reason: "taken" | "invalid" };

export async function bookAppointment(slug: string, day: string, time: string, details: AppointmentDetails): Promise<BookResult> {
  const doctor = await findBookable(slug);
  if (!doctor) return { ok: false, reason: "invalid" };
  if (!clinicSlots(doctor, day).includes(time)) return { ok: false, reason: "invalid" };
  if (!(await daySlots(slug, day)).includes(time)) return { ok: false, reason: "taken" };

  const p = await payload();
  const id = (await doctorIds([slug])).get(slug)!;
  const doc = await p.create({
    collection: "booking-requests",
    data: {
      doctor: id,
      department: doctor.group,
      date: day,
      time,
      name: details.name.trim(),
      mobile: normalizePhMobile(details.mobile)!,
      email: details.email.trim().toLowerCase(),
      firstVisit: details.firstVisit as "yes" | "no",
      reason: details.reason.trim(),
      status: "confirmed",
      manageToken: randomBytes(24).toString("base64url"),
      history: historyLine(null, "Booked online by the patient"),
    },
    depth: 1,
  });
  const [view, h] = await Promise.all([toView(p, doc), hospitalInfo(p)]);
  await Promise.all([emailPatient(p, "booked", view, h), emailStaff(p, "booked", view, h)]);
  return { ok: true, appointment: view };
}

// ---- Managing a booking (link in the patient's email) ----------------------------------

async function findByToken(token: string) {
  if (!/^[\w-]{20,64}$/.test(token)) return null;
  const p = await payload();
  const { docs } = await p.find({ collection: "booking-requests", where: { manageToken: { equals: token } }, limit: 1, depth: 1 });
  return docs[0] ? { p, doc: docs[0], view: await toView(p, docs[0]) } : null;
}

/** Can still be moved or cancelled: active and not started yet. */
export const isChangeable = (a: Pick<AppointmentView, "status" | "day" | "time">) =>
  ACTIVE_STATUSES.includes(a.status) && manilaInstant(a.day, a.time) > new Date();

export async function appointmentByToken(token: string) {
  return (await findByToken(token))?.view ?? null;
}

export async function cancelAppointment(token: string): Promise<AppointmentView | null> {
  const found = await findByToken(token);
  if (!found || !isChangeable(found.view)) return null;
  const { p, doc, view } = found;
  await p.update({
    collection: "booking-requests",
    id: doc.id,
    data: { status: "cancelled", history: historyLine(doc.history, "Cancelled by the patient") },
  });
  const cancelled = { ...view, status: "cancelled" as const };
  const h = await hospitalInfo(p);
  await Promise.all([emailPatient(p, "cancelled", cancelled, h), emailStaff(p, "cancelled", cancelled, h)]);
  return cancelled;
}

export type RescheduleResult = { ok: true; appointment: AppointmentView } | { ok: false; reason: "taken" | "invalid" | "locked" };

export async function rescheduleAppointment(token: string, day: string, time: string): Promise<RescheduleResult> {
  const found = await findByToken(token);
  if (!found) return { ok: false, reason: "invalid" };
  if (!isChangeable(found.view)) return { ok: false, reason: "locked" };
  const { p, doc, view } = found;
  if (day === view.day && time === view.time) return { ok: true, appointment: view };
  if (!(await daySlots(view.doctorSlug, day)).includes(time)) return { ok: false, reason: "taken" };

  const previous = { day: view.day, time: view.time };
  await p.update({
    collection: "booking-requests",
    id: doc.id,
    data: {
      date: day,
      time,
      status: "confirmed",
      history: historyLine(doc.history, `Moved by the patient from ${shortDate(previous.day)} ${formatTime(previous.time)}`),
    },
  });
  const moved = { ...view, day, time, status: "confirmed" as const };
  const h = await hospitalInfo(p);
  await Promise.all([emailPatient(p, "rescheduled", moved, h, previous), emailStaff(p, "rescheduled", moved, h, previous)]);
  return { ok: true, appointment: moved };
}

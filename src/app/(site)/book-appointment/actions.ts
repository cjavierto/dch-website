"use server";

import { validateAppointmentDetails, type AppointmentErrors } from "@/lib/appointments";
import {
  bookAppointment,
  cancelAppointment,
  daySlots,
  monthAvailability,
  nextAvailable,
  rescheduleAppointment,
} from "@/lib/appointmentsServer";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export async function loadNextAvailable() {
  return nextAvailable();
}

export async function loadMonth(doctorSlug: string, month: string) {
  return monthAvailability(String(doctorSlug), String(month));
}

export async function loadDay(doctorSlug: string, day: string) {
  return DAY.test(day) ? daySlots(String(doctorSlug), day) : [];
}

/** What the browser needs after booking: no other patient data. */
export type Booked = { token: string; day: string; time: string; doctorName: string; email: string };

export type BookState =
  | { status: "idle" }
  | { status: "invalid"; errors: AppointmentErrors }
  | { status: "taken" }
  | { status: "error" }
  | { status: "booked"; booked: Booked };

export async function book(_prev: BookState, formData: FormData): Promise<BookState> {
  const get = (k: string) => String(formData.get(k) ?? "");
  // Bots fill the hidden field.
  if (get("website").trim()) return { status: "error" };

  const day = get("date");
  const time = get("time");
  if (!DAY.test(day) || !TIME.test(time)) {
    return { status: "invalid", errors: { slot: "Pick the day and time again." } };
  }
  const details = { name: get("name"), mobile: get("mobile"), email: get("email"), firstVisit: get("firstVisit"), reason: get("reason") };
  const errors = validateAppointmentDetails(details);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  try {
    const result = await bookAppointment(get("doctor"), day, time, details);
    if (!result.ok) {
      return result.reason === "taken"
        ? { status: "taken" }
        : { status: "invalid", errors: { slot: "That time isn't available. Pick the day and time again." } };
    }
    const a = result.appointment;
    return { status: "booked", booked: { token: a.token, day: a.day, time: a.time, doctorName: a.doctorName, email: a.email ?? "" } };
  } catch (err) {
    console.error("Appointment booking failed", err);
    return { status: "error" };
  }
}

export async function cancel(token: string) {
  try {
    return (await cancelAppointment(String(token))) ? ("cancelled" as const) : ("locked" as const);
  } catch (err) {
    console.error("Appointment cancel failed", err);
    return "error" as const;
  }
}

export async function reschedule(token: string, day: string, time: string) {
  if (!DAY.test(day) || !TIME.test(time)) return "invalid" as const;
  try {
    const r = await rescheduleAppointment(String(token), day, time);
    return r.ok ? ("moved" as const) : r.reason;
  } catch (err) {
    console.error("Appointment reschedule failed", err);
    return "error" as const;
  }
}

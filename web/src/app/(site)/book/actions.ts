"use server";

import {
  clinicSlots,
  isBookable,
  isBookableDate,
  validateBookingDetails,
  type BookingErrors,
} from "@/lib/booking";
import { getDoctors, getTakenSlots, saveBookingRequest } from "@/lib/cms";
import { normalizePhMobile } from "@/lib/contact";
import { BOOKING_ENABLED } from "@/lib/features";

async function findBookableDoctor(slug: string) {
  const { doctors } = await getDoctors();
  const doctor = doctors.find((d) => d.slug === slug);
  return doctor && isBookable(doctor) ? doctor : null;
}

/** Taken slot times for the picker's step 4. */
export async function fetchTakenSlots(doctorSlug: string, date: string): Promise<string[]> {
  if (!BOOKING_ENABLED) return [];
  const doctor = await findBookableDoctor(doctorSlug);
  if (!doctor || !isBookableDate(doctor, date)) return [];
  return getTakenSlots(doctor.slug, date);
}

export type BookingState =
  | { status: "idle" }
  | { status: "invalid"; errors: BookingErrors }
  | { status: "taken" }
  | { status: "error" }
  | { status: "sent" };

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  if (!BOOKING_ENABLED) return { status: "error" };
  if (String(formData.get("website") ?? "").trim()) return { status: "sent" };

  const get = (k: string) => String(formData.get(k) ?? "");
  const doctor = await findBookableDoctor(get("doctor"));
  const date = get("date");
  const time = get("time");
  if (!doctor || !isBookableDate(doctor, date) || !clinicSlots(doctor.booking).includes(time)) {
    return { status: "invalid", errors: { slot: "Choose the department, doctor, date and time again." } };
  }

  const details = {
    name: get("name"),
    mobile: get("mobile"),
    philhealth: get("philhealth"),
    firstVisit: get("firstVisit"),
    reason: get("reason"),
  };
  const errors = validateBookingDetails(details);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  try {
    await saveBookingRequest({
      doctorSlug: doctor.slug,
      department: doctor.group,
      date,
      time,
      name: details.name.trim(),
      mobile: normalizePhMobile(details.mobile)!,
      philhealth: details.philhealth.replace(/[\s-]/g, "") || null,
      firstVisit: details.firstVisit as "yes" | "no",
      reason: details.reason.trim(),
    });
  } catch (err) {
    if ((err as Error).message === "slot-taken") return { status: "taken" };
    console.error("Booking request failed", err);
    return { status: "error" };
  }
  return { status: "sent" };
}

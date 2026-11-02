import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { isBookable } from "@/lib/booking";
import { getDoctors, getSiteSettings } from "@/lib/cms";
import { BOOKING_ENABLED } from "@/lib/features";
import { BookingPicker } from "./BookingPicker";

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Request a clinic slot at Deiparine Community Hospital. OPD staff confirm by text within one working day.",
};

/** Online booking — only reachable when NEXT_PUBLIC_BOOKING_ENABLED=true. */
export default async function BookPage() {
  if (!BOOKING_ENABLED) notFound();

  const [{ doctors, groups }, settings] = await Promise.all([getDoctors(), getSiteSettings()]);
  const bookable = doctors.filter(isBookable);
  // Departments in directory order, only those with a bookable doctor.
  const departments = groups.filter((g) => bookable.some((d) => d.group === g));

  return (
    <>
      <PageHero
        title="Book an appointment"
        lead="Request a clinic slot and our OPD staff will confirm by text within one working day."
        crumbs={[{ label: "Book an appointment" }]}
      />
      <section className="mx-auto max-w-[960px] px-4 pt-[18px] pb-8 nav:px-6 nav:pt-11 nav:pb-[72px]">
        {bookable.length === 0 ? (
          <p className="rounded-card-lg border border-line-200 bg-white p-6 text-[15px] text-ink-700">
            No doctors take online requests right now. Please send us a message or call the trunkline at{" "}
            {settings.trunkline}.
          </p>
        ) : (
          <BookingPicker doctors={bookable} departments={departments} emergencyNumber={settings.emergencyNumber} />
        )}
      </section>
    </>
  );
}

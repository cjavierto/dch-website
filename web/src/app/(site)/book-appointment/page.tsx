import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { bookableDoctors } from "@/lib/appointmentsServer";
import { getSiteSettings } from "@/lib/cms";
import { Suspense } from "react";
import { Scheduler } from "./Scheduler";
import { SchedulerWithQuery } from "./SchedulerWithQuery";

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Choose a doctor and a time and you're booked. Reschedule or cancel any time from your confirmation email.",
  // In testing: not linked from the site and kept out of search results.
  robots: { index: false, follow: false },
};

/** Self-service booking (Calendly-style). Not linked from the site yet: the
    "Book Appointment" buttons still follow lib/routes `book`. */
export default async function BookAppointmentPage() {
  const [{ doctors, groups }, s] = await Promise.all([bookableDoctors(), getSiteSettings()]);
  const a = s.address;
  const schedulerProps = {
    doctors,
    groups,
    hospital: {
      name: s.hospitalName,
      place: a.town,
      location: `${s.hospitalName}, Outpatient Department, ${a.street}, ${a.barangay}, ${a.town}, ${a.province}`,
      emergencyNumber: s.emergencyNumber,
      trunkline: s.trunkline,
    },
  };

  return (
    <>
      <PageHero
        title="Book an appointment"
        lead="Choose a doctor, pick a time, and you're booked. It takes about a minute."
        crumbs={[{ label: "Book an appointment" }]}
      />
      <div className="mx-auto max-w-[1040px] px-4 pt-[18px] pb-8 nav:px-6 nav:pt-11 nav:pb-[72px]">
        {doctors.length === 0 ? (
          <p className="rounded-card-lg border border-line-200 bg-white p-6 text-[15px] text-ink-700">
            Online booking isn&apos;t open yet. Please call us at {s.trunkline} to book.
          </p>
        ) : (
          // The static shell has no doctor chosen; the query-aware one takes over.
          <Suspense fallback={<Scheduler {...schedulerProps} />}>
            <SchedulerWithQuery {...schedulerProps} />
          </Suspense>
        )}
      </div>
    </>
  );
}

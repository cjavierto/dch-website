import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { DetailFallback } from "@/components/DetailFallback";
import { PageHero } from "@/components/PageHero";
import { appointmentByToken, isChangeable } from "@/lib/appointmentsServer";
import { getSiteSettings } from "@/lib/cms";
import { routes } from "@/lib/routes";
import { ManageAppointment } from "./ManageAppointment";

export const metadata: Metadata = {
  title: "Your appointment",
  robots: { index: false, follow: false },
};

/** Reached from the link in the patient's confirmation email. */
export default function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <ManageDetail params={params} />
    </Suspense>
  );
}

async function ManageDetail({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connection(); // per request: whether it can still be changed depends on the time now
  const [a, s] = await Promise.all([appointmentByToken(token), getSiteSettings()]);
  if (!a) notFound();

  return (
    <>
      <PageHero
        title="Your appointment"
        lead="Reschedule or cancel here. Changes are emailed to you."
        crumbs={[{ label: "Book an appointment", href: routes.bookAppointment }, { label: "Your appointment" }]}
      />
      <div className="mx-auto max-w-[1040px] px-4 pt-[18px] pb-8 nav:px-6 nav:pt-11 nav:pb-[72px]">
        <ManageAppointment
          appointment={{
            token: a.token,
            status: a.status,
            doctorSlug: a.doctorSlug,
            doctorName: a.doctorName,
            specialty: a.specialty,
            day: a.day,
            time: a.time,
            name: a.name,
          }}
          changeable={isChangeable(a)}
          place={`Outpatient Department, ${s.hospitalName}, ${s.address.town}`}
          trunkline={s.trunkline}
        />
      </div>
    </>
  );
}

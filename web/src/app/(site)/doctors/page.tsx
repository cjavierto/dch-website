import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ButtonLink } from "@/components/ui/Cards";
import { getDoctors, getSiteSettings } from "@/lib/cms";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import { DoctorDirectory } from "./DoctorDirectory";

export const metadata: Metadata = {
  title: "Doctors Directory",
  description: "Consultants at Deiparine Community Hospital and their clinic days.",
};

export default async function DoctorsPage() {
  const [{ doctors, groups }, settings] = await Promise.all([getDoctors(), getSiteSettings()]);

  return (
    <>
      <DoctorDirectory doctors={doctors} groups={groups} />
      <section className="page-container pb-8 nav:pb-[72px]">
        <div className="mt-[22px] flex flex-wrap items-center gap-3.5 rounded-card bg-navy-050 p-[18px]">
          <Icon name="info" size={22} className="text-navy-700" />
          <p className="flex-[1_1_300px] text-[14.5px] leading-[1.6] text-ink-700">
            Filled days are regular clinic days. For appointments, send us a message or call the OPD desk at{" "}
            <a href={telHref(settings.trunkline)} className="font-semibold">
              {settings.trunkline}
            </a>
            .
          </p>
          <ButtonLink href={routes.book} className="px-[18px] py-3 text-[14.5px]">
            Book an appointment
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

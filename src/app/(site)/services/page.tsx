import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { getServices } from "@/lib/cms";
import { ServiceGrid } from "./ServiceGrid";

export const metadata: Metadata = {
  title: "Services & Departments",
  description:
    "Emergency, internal medicine, OB-gynecology, pediatrics, surgery, imaging and laboratory services at Deiparine Community Hospital.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        title="Services & Departments"
        lead="Clinical departments and a full diagnostic suite, staffed by consultants from Cebu City and resident physicians on duty around the clock."
        crumbs={[{ label: "Services" }]}
      />
      <section className="page-container pt-3.5 pb-8 nav:pt-8 nav:pb-[72px]">
        <ServiceGrid services={services} />
      </section>
    </>
  );
}

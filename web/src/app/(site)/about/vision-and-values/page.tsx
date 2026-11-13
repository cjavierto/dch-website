import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { ButtonLink, Panel } from "@/components/ui/Cards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getVisionPage } from "@/lib/cms";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Vision & Values",
  description: "The vision, mission, and values of Deiparine Community Hospital.",
};

export default async function VisionPage() {
  const page = await getVisionPage();

  return (
    <>
      <PageHero
        title="Vision, Mission & Values"
        lead={page.lead}
        crumbs={[{ label: "About", href: routes.about }, { label: "Vision & Values" }]}
      />

      <section className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-3 pt-6 nav:gap-5 nav:pt-12 nav:pb-2">
        <div className="on-navy rounded-card-lg bg-navy-700 p-[22px] text-white nav:rounded-panel nav:p-8">
          <Icon name="visibility" size={30} className="text-gold-500" />
          <h2 className="mt-3.5 mb-3 font-display text-[22px] font-bold nav:text-[28px]">Our vision</h2>
          <p className="text-base leading-[1.6] text-[var(--dch-on-navy-strong)] nav:text-lg">{page.vision}</p>
        </div>
        <Panel className="nav:p-8">
          <Icon name="local_hospital" size={30} className="text-green-600" />
          <h2 className="mt-3.5 mb-3 font-display text-[22px] font-bold nav:text-[28px]">Our mission</h2>
          <p className="text-[15px] leading-[1.7] text-ink-700 nav:text-base">{page.mission}</p>
        </Panel>
      </section>

      <section className="page-container pt-8 pb-8 nav:pt-12 nav:pb-[72px]">
        <SectionHeading eyebrow={page.valuesEyebrow} size={32}>
          {page.valuesHeading}
        </SectionHeading>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3 nav:mt-6 nav:gap-[18px]">
          {page.values.map((v) => (
            <Panel key={v.title}>
              <Icon name={v.icon} size={30} className="text-green-600" />
              <h3 className="mt-3.5 mb-[7px] text-[17.5px] font-bold nav:text-[18.5px]">{v.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-ink-500">{v.text}</p>
            </Panel>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-[18px] rounded-card-lg border border-green-100 bg-green-050 p-5 nav:mt-8 nav:p-[26px]">
          <Icon name="volunteer_activism" size={30} className="text-green-600" />
          <p className="flex-[1_1_320px] text-[15px] leading-[1.6] text-green-900 nav:text-base">{page.rightsNote}</p>
          <ButtonLink href={routes.contact} variant="green">
            Talk to us
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

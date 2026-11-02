import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { NavyPanel, Panel } from "@/components/ui/Cards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAboutPage } from "@/lib/cms";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "About DCH",
  description: "A family-run community hospital that has cared for southern Cebu since 1974.",
};

export default async function AboutPage() {
  const page = await getAboutPage();
  const [main, ...small] = page.story.photos;

  return (
    <>
      <PageHero title="About DCH" lead={page.lead} crumbs={[{ label: "About", href: routes.about }, { label: "About DCH" }]} />

      <section className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-6 pt-6 nav:gap-9 nav:pt-12 nav:pb-2">
        <div>
          <SectionHeading eyebrow={page.story.eyebrow} size={32}>
            {page.story.heading}
          </SectionHeading>
          <div className="mt-3 flex flex-col gap-3.5 nav:mt-4">
            {page.story.paragraphs.map((p) => (
              <p key={p} className="text-[15px] leading-[1.7] text-ink-700 nav:text-base">
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="relative h-[200px] overflow-hidden rounded-card nav:h-[230px]">
            <Image src={main.src} alt={main.alt} fill sizes="(min-width: 60rem) 600px, 100vw" className="object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {small.map((p) => (
              <div key={p.src} className="relative h-[130px] overflow-hidden rounded-card nav:h-[150px]">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 60rem) 300px, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container pt-8 nav:py-12">
        <SectionHeading eyebrow="Milestones" size={32}>
          Fifty years, marked
        </SectionHeading>
        <ol className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))] gap-3 nav:mt-6 nav:gap-[18px]">
          {page.milestones.map((m) => (
            <li key={m.year}>
              <Panel className="h-full">
                <div className="font-display text-[26px] font-bold text-navy-700 nav:text-[30px]">{m.year}</div>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-ink-500">{m.text}</p>
              </Panel>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-container pt-8 pb-8 nav:pt-2 nav:pb-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-3 nav:gap-5">
          {page.facts.map((f) => (
            <Panel key={f.title}>
              <Icon name={f.icon} size={28} className="text-navy-700" />
              <h3 className="mt-3 mb-1.5 text-lg font-bold nav:text-[19px]">{f.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-ink-500">{f.text}</p>
            </Panel>
          ))}
          <NavyPanel icon="flag" title="Where we are headed" link={{ href: routes.vision, label: "Vision & Values" }}>
            Read the vision, mission, and values that guide our next decade.
          </NavyPanel>
        </div>
      </section>
    </>
  );
}

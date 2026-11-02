import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { Checklist, Panel } from "@/components/ui/Cards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { getJobPostings, getSiteSettings } from "@/lib/cms";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open positions at Deiparine Community Hospital in Sibonga, Cebu.",
};

export default async function CareersPage() {
  const [{ jobs, benefits }, settings] = await Promise.all([getJobPostings(), getSiteSettings()]);
  const count = jobs.length;

  return (
    <>
      <PageHero
        title="Careers at DCH"
        lead="Build a clinical career without leaving the province. We hire locally and train continuously."
        crumbs={[{ label: "About", href: routes.about }, { label: "Careers" }]}
      />

      <section className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-6 pt-6 pb-8 nav:gap-[34px] nav:pt-12 nav:pb-[104px]">
        <div>
          <SectionHeading eyebrow="Open positions" size={32} className="mb-4 nav:mb-6">
            {count === 0 ? "No roles open right now" : `${count} ${count === 1 ? "role" : "roles"} currently open`}
          </SectionHeading>
          <ul className="flex flex-col gap-3">
            {jobs.map((j) => (
              <li key={j.slug}>
                <Link
                  href={routes.job(j.slug)}
                  className="flex flex-wrap items-center gap-3.5 rounded-card-lg border border-line-200 bg-white p-[18px] text-ink-900 hover:border-navy-700 hover:text-ink-900 nav:p-[22px]"
                >
                  <Icon name={j.icon} size={26} className="text-navy-700" />
                  <span className="flex-[1_1_200px]">
                    <span className="block text-[17px] font-bold nav:text-lg">{j.title}</span>
                    <span className="mt-[3px] block text-sm text-ink-500">
                      {j.department} · {j.location}
                    </span>
                  </span>
                  <Tag label={j.employmentType} tone="info" />
                  <Icon name="arrow_forward" size={22} className="text-ink-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 nav:gap-[18px]">
          <div className="relative h-[180px] overflow-hidden rounded-card nav:h-[200px]">
            <Image src="/images/conference.png" alt="DCH team" fill sizes="(min-width: 60rem) 600px, 100vw" className="object-cover" />
          </div>
          <Panel>
            <h2 className="mb-3.5 text-lg font-bold nav:text-[19px]">Why work here</h2>
            <Checklist items={benefits} />
          </Panel>
          <div className="on-navy rounded-card bg-navy-700 p-5 text-white nav:rounded-card-lg nav:p-6">
            <h2 className="mb-2 text-lg font-bold nav:text-[19px]">Don&apos;t see your role?</h2>
            <p className="mb-3.5 text-[14.5px] leading-[1.6] text-on-navy-body">
              Send your CV to {settings.careersEmail} and we will keep it on file for six months.
            </p>
            <a
              href={`mailto:${settings.careersEmail}`}
              className="inline-flex items-center gap-[7px] text-[15px] font-bold text-gold-500 hover:text-gold-300"
            >
              <Icon name="mail" size={19} />
              {settings.careersEmail}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

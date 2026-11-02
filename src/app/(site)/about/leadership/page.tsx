import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink, NavyPanel, Panel } from "@/components/ui/Cards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getStaff } from "@/lib/cms";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Our Staff & Leadership Team",
  description: "The people who run Deiparine Community Hospital, and the care team behind them.",
};

export default async function LeadershipPage() {
  const { staff, teamCounts } = await getStaff();
  const director = staff.find((s) => s.group === "director");
  const leadership = staff.filter((s) => s.group === "leadership");
  const heads = staff.filter((s) => s.group === "department-head");
  const teamSize = teamCounts.reduce((sum, t) => sum + t.count, 0);

  return (
    <>
      <PageHero
        title="Our Staff & Leadership Team"
        lead={`The people who run the hospital and the ${teamSize}-strong nursing, allied-health, and support team behind them.`}
        crumbs={[{ label: "About", href: routes.about }, { label: "Our Staff & Leadership Team" }]}
      />

      <section className="page-container pt-6 nav:pt-10 nav:pb-2">
        <SectionHeading eyebrow="Leadership team" size={32} className="mb-4 nav:mb-[22px]">
          Who runs the hospital
        </SectionHeading>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-3 nav:gap-[18px]">
          {director && (
            <article className="overflow-hidden rounded-card-lg border border-line-200 bg-white">
              {director.photo && (
                <div className="relative h-[230px] nav:h-[250px]">
                  <Image
                    src={director.photo}
                    alt={director.name}
                    fill
                    sizes="(min-width: 60rem) 400px, 100vw"
                    className="object-cover object-[center_18%]"
                  />
                </div>
              )}
              <div className="p-[18px] nav:p-5">
                <h3 className="mb-1 text-lg font-bold nav:text-[19px]">{director.name}</h3>
                <div className="mb-2.5 text-sm font-semibold text-green-600">{director.title}</div>
                {director.bio && <p className="text-[14.5px] leading-[1.55] text-ink-500">{director.bio}</p>}
              </div>
            </article>
          )}
          <Panel className="flex flex-col gap-4 nav:p-5">
            {leadership.map((p) => (
              <div key={p.name} className="flex items-center gap-3.5">
                <Avatar name={p.name} initials={p.initials} photo={p.photo} size={52} />
                <div>
                  <h3 className="mb-0.5 text-base font-bold nav:text-[17px]">{p.name}</h3>
                  <div className="text-[13.5px] font-semibold text-green-600">{p.title}</div>
                </div>
              </div>
            ))}
          </Panel>
          <NavyPanel icon="groups" title={`${teamSize} in the care team`} link={{ href: routes.careers, label: "Join the team" }}>
            Nurses, midwives, medical technologists, radiologic technologists, pharmacists, and support staff — most of them
            from Sibonga and neighbouring towns.
          </NavyPanel>
        </div>
      </section>

      <section className="page-container pt-8 nav:pt-11 nav:pb-2">
        <SectionHeading eyebrow="Department heads" size={32} className="mb-4 nav:mb-[18px]">
          Who to ask for, by section
        </SectionHeading>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-3 nav:gap-[18px]">
          {heads.map((h) => (
            <Panel key={h.section} className="flex items-start gap-3.5 nav:p-5">
              {h.icon && <Icon name={h.icon} size={26} className="text-navy-700" />}
              <div className="min-w-0">
                <div className="mb-1.5 text-[11.5px] font-bold tracking-[1.2px] text-ink-400 uppercase">{h.section}</div>
                <h3 className="mb-[3px] text-base font-bold nav:text-[17px]">{h.name}</h3>
                <div className="mb-2 text-[13.5px] font-semibold text-green-600">{h.title}</div>
                {h.bio && <p className="text-sm leading-[1.55] text-ink-500">{h.bio}</p>}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section className="page-container pt-8 pb-8 nav:pt-11 nav:pb-[72px]">
        <SectionHeading eyebrow="The wider team" size={32} className="mb-4 nav:mb-[18px]">
          {teamSize} people, mostly from Sibonga
        </SectionHeading>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] items-start gap-3 nav:gap-[18px]">
          {teamCounts.map((t) => (
            <div key={t.role} className="flex flex-col rounded-card border border-line-200 bg-white p-[18px] nav:p-5">
              <dt className="order-2 mt-2 text-[15px] font-semibold">{t.role}</dt>
              <dd className="order-1 font-display text-[28px] leading-none font-bold text-navy-700 nav:text-[32px]">{t.count}</dd>
              <dd className="order-3 mt-1 text-[13.5px] leading-[1.5] text-ink-500">{t.note}</dd>
            </div>
          ))}
        </dl>
        <div className="on-navy mt-6 flex flex-wrap items-center gap-[18px] rounded-card-lg bg-navy-700 p-5 nav:p-[26px]">
          <Icon name="groups" size={30} className="text-gold-500" />
          <p className="flex-[1_1_320px] text-[15px] leading-[1.6] text-on-navy-body nav:text-base">
            We hire, train, and promote locally. Most of the care team come from Sibonga and the neighbouring towns of
            Argao, Dumanjug, and Barili.
          </p>
          <ButtonLink href={routes.careers} variant="gold">
            See open positions
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

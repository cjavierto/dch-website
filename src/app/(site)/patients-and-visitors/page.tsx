import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { Checklist, Panel } from "@/components/ui/Cards";
import { getPatientsPage, getSiteSettings } from "@/lib/cms";
import { telHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Patients & Visitors",
  description: "What to bring, what happens on the day, visiting hours, and how billing works at Deiparine Community Hospital.",
};

export default async function PatientsPage() {
  const [page, settings] = await Promise.all([getPatientsPage(), getSiteSettings()]);
  const trunk = telHref(settings.trunkline);

  return (
    <>
      <PageHero title="Patients & Visitors" lead={page.lead} crumbs={[{ label: "Patients & Visitors" }]} />

      <div className="page-container flex flex-col gap-3 pt-[18px] pb-8 nav:gap-8 nav:pt-11 nav:pb-[72px]">
        {/* What to bring — full width */}
        <Panel as="section" className="nav:p-[26px]" >
          <div id="admission" className="mb-2 flex items-center gap-2.5">
            <Icon name="assignment" size={26} className="text-navy-700" />
            <h2 className="font-display text-[22px] font-bold nav:text-2xl">What to bring</h2>
          </div>
          <p className="mb-5 text-[15px] leading-[1.6] text-ink-700 nav:mb-[22px]">{page.bringIntro}</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-[34px] gap-y-6 nav:gap-y-[26px]">
            {page.checklists.map((g) => (
              <div key={g.title}>
                <div className="mb-3 flex items-center gap-[9px]">
                  <Icon name={g.icon} size={20} className="text-green-600" />
                  <h3 className="text-base font-bold nav:text-[16.5px]">{g.title}</h3>
                </div>
                <Checklist items={g.items} className="nav:grid nav:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]" />
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-3 nav:gap-8">
          {/* What happens on the day */}
          <Panel as="section" className="nav:p-[26px]">
            <div className="mb-2 flex items-center gap-2.5">
              <Icon name="route" size={26} className="text-navy-700" />
              <h2 className="font-display text-[22px] font-bold nav:text-2xl">What happens on the day</h2>
            </div>
            <p className="mb-5 text-[15px] leading-[1.6] text-ink-700">{page.stepsIntro}</p>
            <ol className="flex flex-col gap-3.5">
              {page.steps.map((step, i) => {
                const last = i === page.steps.length - 1;
                return (
                  <li key={step.title} className="flex items-start gap-3.5">
                    <span
                      className={`flex size-[30px] flex-none items-center justify-center rounded-full text-sm font-bold text-white ${
                        last ? "bg-green-600" : "bg-navy-700"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[15.5px] font-bold">{step.title}</span>
                      <span className="mt-[3px] block text-[14.5px] leading-[1.55] text-ink-500">{step.text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <div className="flex flex-col gap-3 nav:gap-[18px]">
            {/* Visiting hours */}
            <section id="visiting-hours" className="on-navy rounded-card bg-navy-700 p-5 text-white nav:rounded-card-lg nav:p-6">
              <div className="mb-3.5 flex items-center gap-2.5">
                <Icon name="schedule" size={24} className="text-gold-500" />
                <h2 className="text-lg font-bold nav:text-[19px]">Visiting hours</h2>
              </div>
              <dl>
                {settings.visitingHours.map((v, i) => (
                  <div
                    key={v.area}
                    className={`flex justify-between gap-4 py-[9px] text-[15px] ${
                      i < settings.visitingHours.length - 1 ? "border-b border-white/14" : ""
                    }`}
                  >
                    <dt className="text-on-navy-body">{v.area}</dt>
                    <dd className="font-bold">{v.hours}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3.5 text-[13.5px] leading-[1.5] text-on-navy-body">{settings.visitingRules}</p>
            </section>

            {/* Help desks */}
            <Panel as="section">
              <div className="mb-3.5 flex items-center gap-2.5">
                <Icon name="support_agent" size={24} className="text-green-600" />
                <h2 className="text-lg font-bold nav:text-[19px]">Need help?</h2>
              </div>
              <ul className="flex flex-col gap-3 text-[15px]">
                <li>
                  <a href={trunk} className="flex items-center gap-[9px] text-ink-900 hover:text-navy-700">
                    <Icon name="call" size={19} className="text-ink-400" />
                    Admitting: {settings.trunkline}
                  </a>
                </li>
                <li>
                  <a href={trunk} className="flex items-center gap-[9px] text-ink-900 hover:text-navy-700">
                    <Icon name="receipt_long" size={19} className="text-ink-400" />
                    Billing &amp; PhilHealth desk
                  </a>
                </li>
                <li>
                  <a href={trunk} className="flex items-center gap-[9px] text-ink-900 hover:text-navy-700">
                    <Icon name="volunteer_activism" size={19} className="text-ink-400" />
                    Medical social services
                  </a>
                </li>
              </ul>
            </Panel>

            {/* Billing */}
            <Panel as="section">
              <div id="billing" className="mb-3.5 flex items-center gap-2.5">
                <Icon name="payments" size={24} className="text-navy-700" />
                <h2 className="text-lg font-bold nav:text-[19px]">How billing works</h2>
              </div>
              <div className="flex flex-col gap-[13px] text-[14.5px] leading-[1.6] text-ink-700">
                {page.billing.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-[9px] border-t border-line-100 pt-3.5">
                <Icon name="info" size={19} className="text-ink-400" />
                <p className="text-[13.5px] leading-[1.55] text-ink-500">{page.billingNote}</p>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}

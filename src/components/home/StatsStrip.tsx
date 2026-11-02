import type { HomepageSettings } from "@/lib/types";

/** Navy figures strip. Shown only when "showStats" is on in homepage settings. */
export function StatsStrip({ stats }: { stats: HomepageSettings["stats"] }) {
  return (
    <section aria-label="DCH at a glance" className="page-container pt-[22px] nav:py-14">
      <dl className="grid grid-cols-2 gap-[18px] rounded-card-lg bg-navy-700 p-5 nav:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] nav:gap-7 nav:rounded-panel nav:p-9">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="mt-1 text-[13px] text-on-navy-body nav:mt-1.5 nav:text-[14.5px]">
              <span className="nav:hidden">{s.labelShort}</span>
              <span className="hidden nav:inline">{s.label}</span>
            </dt>
            <dd className="m-0 font-display text-[28px] leading-none font-bold text-gold-500 nav:text-[40px]">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

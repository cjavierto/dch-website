import Link from "next/link";
import { Icon } from "@/components/Icon";
import { routes } from "@/lib/routes";
import type { Service } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section aria-labelledby="services-heading" className="page-container pt-6 nav:pt-[72px] nav:pb-2">
      <div className="mb-3.5 flex flex-wrap items-end gap-4 nav:mb-7">
        <div>
          <SectionHeading eyebrow="Our services" size={36} id="services-heading">
            Care for every stage of life
          </SectionHeading>
        </div>
        <Link
          href={routes.services}
          className="ml-auto hidden items-center gap-1.5 text-[15px] font-bold nav:flex"
        >
          View all departments
          <Icon name="arrow_forward" size={19} />
        </Link>
      </div>

      <ul className="flex flex-col gap-2.5 nav:grid nav:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] nav:gap-[18px]">
        {services.map((s) => (
          <li key={s.slug} className="contents">
            <Link
              href={routes.service(s.slug)}
              className="flex items-center gap-[13px] rounded-card border border-line-200 bg-white p-[15px] text-ink-900 hover:border-green-600 hover:text-ink-900 nav:block nav:p-6"
            >
              <Icon name={s.icon} size={26} className="text-green-600 nav:hidden" />
              <Icon name={s.icon} size={32} className="hidden text-green-600 nav:inline-block" />
              <div className="flex-1">
                <h3 className="text-[15.5px] font-bold nav:mt-3.5 nav:mb-1.5 nav:text-lg">{s.home!.title}</h3>
                <p className="mt-0.5 text-[13px] text-ink-500 nav:hidden">{s.home!.summaryShort}</p>
                <p className="hidden text-[14.5px] leading-[1.6] text-ink-500 nav:block">{s.home!.summary}</p>
              </div>
              <Icon name="chevron_right" size={20} className="text-ink-300 nav:hidden" />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={routes.services}
        className="mt-2.5 flex items-center justify-center gap-[7px] rounded-[12px] border border-line-300 p-[13px] text-[15px] font-bold nav:hidden"
      >
        All departments
        <Icon name="arrow_forward" size={19} />
      </Link>
    </section>
  );
}

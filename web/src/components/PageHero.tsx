import Link from "next/link";
import type { ReactNode } from "react";
import { routes } from "@/lib/routes";

/** Navy page header used by every inner page: breadcrumb, H1, lead. */
export function PageHero({
  title,
  lead,
  crumbs,
  children,
}: {
  title: string;
  lead?: ReactNode;
  /** Extra content under the lead, e.g. a search card. */
  children?: ReactNode;
  /** Trail after "Home"; the last item is the current page. */
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <section className="on-navy bg-navy-900">
      <div className="page-container pt-5 pb-[22px] nav:py-[52px]">
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-on-navy-muted nav:mb-2.5 nav:text-[13.5px]">
          <ol className="flex flex-wrap gap-1">
            <li>
              <Link href={routes.home} className="text-on-navy-muted hover:text-white">
                Home
              </Link>
            </li>
            {crumbs.map((c, i) => {
              const current = i === crumbs.length - 1;
              return (
                <li key={c.label} className="flex gap-1">
                  <span aria-hidden="true">/</span>
                  {c.href && !current ? (
                    <Link href={c.href} className="text-on-navy-muted hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current={current ? "page" : undefined}>{c.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="font-display text-[27px] font-bold tracking-[-0.5px] text-white nav:text-[44px] nav:tracking-[-0.8px]">
          {title}
        </h1>
        {lead && (
          <p className="mt-2.5 max-w-[38em] text-[14.5px] leading-[1.55] text-on-navy-body nav:mt-3.5 nav:text-[17.5px]">
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

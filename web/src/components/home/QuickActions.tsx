import Link from "next/link";
import { Icon } from "@/components/Icon";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { HomepageSettings, QuickLink } from "@/lib/types";

const TARGETS: Record<Exclude<QuickLink["link"], "custom">, string> = {
  book: routes.book,
  doctors: routes.doctors,
  patients: routes.patients,
  services: routes.services,
  news: routes.news,
  health: routes.health,
  careers: routes.careers,
  contact: routes.contact,
  about: routes.about,
};

const hrefOf = (q: QuickLink) => (q.link === "custom" ? q.url || routes.home : TARGETS[q.link]);

/** Shortcut cards (edited in Settings → Homepage), then the emergency card.
    On desktop they overlap the bottom of the hero. */
export function QuickActions({
  links,
  emergency,
  emergencyNumber,
}: {
  links: QuickLink[];
  emergency: HomepageSettings["emergencyCard"];
  emergencyNumber: string;
}) {
  const card = "flex flex-col gap-2 rounded-card border p-[15px] nav:gap-2.5 nav:p-5";
  const title = "text-[14.5px] leading-[1.3] font-bold nav:text-[16.5px]";
  const detail = "hidden text-[13.5px] leading-[1.45] nav:block";
  const linkCard = `${card} border-line-200 bg-white text-ink-900 hover:border-navy-700 hover:text-navy-700 nav:shadow-card`;

  return (
    <section aria-label="Quick links" className="page-container relative z-[5] pt-4 nav:-mt-[38px] nav:pt-0">
      {/* Computers: all cards on one row, however many there are. */}
      <div
        className="grid grid-cols-2 gap-2.5 nav:grid-cols-[repeat(var(--cards),minmax(0,1fr))] nav:gap-4"
        style={{ "--cards": links.length + 1 } as React.CSSProperties}
      >
        {links.map((q) => {
          const href = hrefOf(q);
          const body = (
            <>
              <Icon name={q.icon} size={30} className="text-navy-700" />
              <span className={title}>{q.title}</span>
              {q.detail && <span className={`${detail} text-ink-500`}>{q.detail}</span>}
            </>
          );
          return href.startsWith("/") ? (
            <Link key={q.title} href={href} className={linkCard}>
              {body}
            </Link>
          ) : (
            <a key={q.title} href={href} className={linkCard} target="_blank" rel="noopener noreferrer">
              {body}
            </a>
          );
        })}
        <a
          href={telHref(emergencyNumber)}
          className={`${card} border-red-700 bg-red-700 text-white hover:bg-red-800 hover:text-white nav:shadow-card-emergency`}
        >
          <Icon name="emergency" size={30} className="text-red-100" />
          <span className={title}>{emergency.title}</span>
          {emergency.detail && <span className={`${detail} text-red-200`}>{emergency.detail}</span>}
        </a>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";

type Action = { href: string; icon: IconName; title: string; detail: string };

/** Four shortcut cards. On desktop they overlap the bottom of the hero. */
export function QuickActions({ emergencyNumber }: { emergencyNumber: string }) {
  const actions: Action[] = [
    { href: routes.book, icon: "event_available", title: "Book Appointment", detail: "Message OPD to request a slot" },
    { href: routes.doctors, icon: "badge", title: "Doctors Directory", detail: "Who is in clinic today" },
    { href: routes.patients, icon: "assignment", title: "Patients & Visitors", detail: "Admission, billing, visiting hours" },
  ];

  const card =
    "flex flex-col gap-2 rounded-card border p-[15px] nav:gap-2.5 nav:p-5";
  const title = "text-[14.5px] leading-[1.3] font-bold nav:text-[16.5px]";
  const detail = "hidden text-[13.5px] leading-[1.45] nav:block";

  return (
    <section aria-label="Quick links" className="page-container relative z-[5] pt-4 nav:-mt-[38px] nav:pt-0">
      <div className="grid grid-cols-2 gap-2.5 nav:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] nav:gap-4">
        {actions.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className={`${card} border-line-200 bg-white text-ink-900 hover:border-navy-700 hover:text-navy-700 nav:shadow-card`}
          >
            <Icon name={a.icon} size={30} className="text-navy-700" />
            <span className={title}>{a.title}</span>
            <span className={`${detail} text-ink-500`}>{a.detail}</span>
          </Link>
        ))}
        <a
          href={telHref(emergencyNumber)}
          className={`${card} border-red-700 bg-red-700 text-white hover:bg-red-800 hover:text-white nav:shadow-card-emergency`}
        >
          <Icon name="emergency" size={30} className="text-red-100" />
          <span className={title}>Emergency Room</span>
          <span className={`${detail} text-red-200`}>Open 24 hours · {emergencyNumber}</span>
        </a>
      </div>
    </section>
  );
}

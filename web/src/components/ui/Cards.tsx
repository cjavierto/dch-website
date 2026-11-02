import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { telHref } from "@/lib/format";

/** White card: hairline border, 16px radius (14px on phones). */
export function Panel({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag className={`rounded-card border border-line-200 bg-white p-[18px] nav:rounded-card-lg nav:p-6 ${className}`}>
      {children}
    </Tag>
  );
}

/** Navy card with an optional gold link — used for side notes and CTAs. */
export function NavyPanel({
  icon,
  title,
  children,
  link,
  className = "",
}: {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  link?: { href: string; label: string; icon?: IconName };
  className?: string;
}) {
  return (
    <div className={`on-navy flex flex-col gap-3 rounded-card bg-navy-700 p-5 text-white nav:rounded-card-lg nav:p-6 ${className}`}>
      {icon && <Icon name={icon} size={28} className="text-gold-500" />}
      <h3 className="text-[17px] font-bold nav:text-[19px]">{title}</h3>
      {children && <div className="text-[14.5px] leading-[1.6] text-on-navy-body">{children}</div>}
      {link && (
        <Link
          href={link.href}
          className="mt-auto inline-flex items-center gap-[7px] text-[15px] font-bold text-gold-500 hover:text-gold-300"
        >
          {link.icon && <Icon name={link.icon} size={19} />}
          {link.label}
          {!link.icon && <Icon name="arrow_forward" size={19} />}
        </Link>
      )}
    </div>
  );
}

/** Red emergency card — the only decorative use of red on the site. */
export function EmergencyCard({
  title,
  text,
  emergencyNumber,
}: {
  title: string;
  text: string;
  emergencyNumber: string;
}) {
  return (
    <div className="on-navy flex items-start gap-3 rounded-card bg-red-700 p-[18px] text-white nav:rounded-card-lg nav:p-6">
      <Icon name="emergency" size={26} className="text-red-100" />
      <div>
        <h3 className="mb-[5px] text-base font-bold nav:mb-1.5 nav:text-[17.5px]">{title}</h3>
        <p className="text-[14px] leading-[1.5] text-red-200 nav:text-[14.5px]">
          {text}{" "}
          <a href={telHref(emergencyNumber)} className="font-bold whitespace-nowrap text-white hover:text-red-200">
            {emergencyNumber}
          </a>
        </p>
      </div>
    </div>
  );
}

/** Green check list. */
export function Checklist({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-2.5 nav:gap-[11px] ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-[9px] text-[15px] leading-[1.5] text-ink-900">
          <Icon name="check_circle" size={19} className="mt-px text-green-600" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Primary navy button-link. */
export function ButtonLink({
  href,
  children,
  icon,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  icon?: IconName;
  variant?: "primary" | "outline" | "gold" | "green";
  className?: string;
}) {
  const styles = {
    primary: "bg-navy-700 text-white hover:bg-navy-900 hover:text-white",
    outline: "border border-line-300 text-ink-900 hover:border-navy-700 hover:text-navy-700",
    gold: "bg-gold-500 text-gold-900 hover:bg-gold-300 hover:text-gold-900",
    green: "bg-green-600 text-white hover:bg-green-900 hover:text-white",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-button px-5 py-[13px] text-[15px] font-bold ${styles} ${className}`}
    >
      {icon && <Icon name={icon} size={19} />}
      {children}
    </Link>
  );
}

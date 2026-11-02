"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { routes } from "@/lib/routes";

type MenuId = "services" | "about" | "news";

export type MegaMenuService = {
  href: string;
  name: string;
  icon: IconName;
  summary: string;
};

const aboutLinks: MenuLinkProps[] = [
  { href: routes.about, icon: "apartment", title: "About DCH", summary: "History, facility, accreditation" },
  { href: routes.vision, icon: "flag", title: "Vision & Values", summary: "What we stand for" },
  { href: routes.leadership, icon: "groups", title: "Our Staff & Leadership Team", summary: "Medical director, consultants, nurses" },
  { href: routes.careers, icon: "work", title: "Careers", summary: "Current openings at DCH" },
];

const newsLinks: MenuLinkProps[] = [
  { href: routes.news, icon: "campaign", title: "News & Announcements", summary: "Advisories, missions, updates" },
  { href: routes.health, icon: "menu_book", title: "Health Information", summary: "Guides from our doctors" },
];

/**
 * Desktop primary nav (≥1240px). Dropdowns open on hover or on the chevron
 * button, and close on mouse leave, outside click, Escape, or focus leaving
 * the nav. Each panel opens under its own item. Opening is instant (no
 * animation, per the motion rules); closing or switching waits briefly so a
 * diagonal mouse path across a neighbouring item doesn't snap the menu shut.
 */
export function DesktopNav({
  services,
  outpatientHours,
}: {
  services: MegaMenuService[];
  outpatientHours: string;
}) {
  const [open, setOpenState] = useState<MenuId | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Immediate change (clicks, keyboard, navigation). */
  const setOpen = useCallback((id: MenuId | null) => {
    if (timer.current) clearTimeout(timer.current);
    setOpenState(id);
  }, []);
  const close = useCallback(() => setOpen(null), [setOpen]);

  /** Hover change: opening from closed is instant; closing or switching is
      delayed, and cancelled if the pointer comes back in time. */
  const hover = useCallback(
    (id: MenuId | null) => {
      if (timer.current) clearTimeout(timer.current);
      if (id === open) return;
      if (open === null) {
        setOpenState(id);
        return;
      }
      timer.current = setTimeout(() => setOpenState(id), HOVER_DELAY_MS);
    },
    [open],
  );
  const hoverClose = useCallback(() => hover(null), [hover]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = navRef.current?.querySelector<HTMLButtonElement>(
        `[aria-controls="menu-${open}"]`,
      );
      setOpen(null);
      trigger?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="relative ml-auto hidden flex-nowrap items-center justify-end menu:flex"
      onMouseLeave={hoverClose}
      onBlur={(e) => {
        // Keyboard focus moved elsewhere on the page. (Pointer clicks outside
        // are handled by the pointerdown listener.)
        const next = e.relatedTarget as Node | null;
        if (next && !e.currentTarget.contains(next)) close();
      }}
    >
      <NavLink href={routes.home} onMouseEnter={hoverClose}>
        Home
      </NavLink>

      <NavDropdown id="services" label="Services" href={routes.services} open={open} setOpen={setOpen} hover={hover}>
        <MenuPanel id="services" label="Services" width={640} align="left" onNavigate={close}>
          <div className="col-span-full px-2 pb-1.5 text-[11.5px] font-bold tracking-[1.2px] text-ink-400 uppercase">
            Clinical departments
          </div>
          {services.map((s) => (
            <MenuLink key={s.href} href={s.href} icon={s.icon} title={s.name} summary={s.summary} />
          ))}
          <div className="col-span-full mt-2.5 flex items-center gap-2.5 border-t border-line-100 pt-3.5">
            <Icon name="local_hospital" size={20} className="text-green-600" />
            <span className="text-[13.5px] text-ink-700">Outpatient clinics open {outpatientHours}</span>
            <Link href={routes.services} className="ml-auto text-[13.5px] font-bold">
              All services →
            </Link>
          </div>
        </MenuPanel>
      </NavDropdown>

      <NavDropdown id="about" label="About" href={routes.about} open={open} setOpen={setOpen} hover={hover}>
        <MenuPanel id="about" label="About" width={560} align="left" onNavigate={close}>
          {aboutLinks.map((l) => (
            <MenuLink key={l.href} {...l} />
          ))}
        </MenuPanel>
      </NavDropdown>

      <NavLink href={routes.patients} onMouseEnter={hoverClose}>
        Patients &amp; Visitors
      </NavLink>
      <NavLink href={routes.doctors} onMouseEnter={hoverClose}>
        Doctors Directory
      </NavLink>

      <NavDropdown id="news" label="News & Health Info" href={routes.news} open={open} setOpen={setOpen} hover={hover}>
        <MenuPanel id="news" label="News & Health Info" width={560} align="right" onNavigate={close}>
          {newsLinks.map((l) => (
            <MenuLink key={l.href} {...l} />
          ))}
        </MenuPanel>
      </NavDropdown>

      <Link
        href={routes.book}
        onMouseEnter={hoverClose}
        className="ml-1.5 flex items-center gap-2 rounded-button bg-navy-700 px-4 py-3 text-[14.5px] font-bold whitespace-nowrap text-white hover:bg-navy-900 hover:text-white"
      >
        <Icon name="event_available" size={19} />
        Book Appointment
      </Link>
    </nav>
  );
}

const HOVER_DELAY_MS = 200;

const itemText =
  "text-[15px] font-semibold whitespace-nowrap text-ink-900 hover:text-navy-700";

function NavLink({
  href,
  children,
  onMouseEnter,
}: {
  href: string;
  children: ReactNode;
  onMouseEnter: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      className={`block rounded-[8px] px-2 py-2.5 hover:bg-navy-050 ${itemText}`}
    >
      {children}
    </Link>
  );
}

function NavDropdown({
  id,
  label,
  href,
  open,
  setOpen,
  hover,
  children,
}: {
  id: MenuId;
  label: string;
  href: string;
  open: MenuId | null;
  setOpen: (id: MenuId | null) => void;
  hover: (id: MenuId | null) => void;
  children: ReactNode;
}) {
  const isOpen = open === id;
  return (
    // relative: the panel is positioned under this item, not the whole nav.
    <div className="relative" onMouseEnter={() => hover(id)}>
      <div
        className={`group flex items-center rounded-[8px] hover:bg-navy-050 ${isOpen ? "bg-navy-050" : ""}`}
      >
        <Link
          href={href}
          onClick={() => setOpen(null)}
          className={`py-2.5 pr-[3px] pl-2 ${itemText} ${isOpen ? "text-navy-700" : ""}`}
        >
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`menu-${id}`}
          aria-label={`${isOpen ? "Hide" : "Show"} ${label} menu`}
          onClick={() => setOpen(isOpen ? null : id)}
          className={`flex items-center self-stretch rounded-r-[8px] pr-2 group-hover:text-navy-700 ${isOpen ? "text-navy-700" : "text-ink-900"}`}
        >
          <Icon name="expand_more" size={18} />
        </button>
      </div>
      {isOpen && children}
    </div>
  );
}

function MenuPanel({
  id,
  label,
  width,
  align,
  onNavigate,
  children,
}: {
  id: MenuId;
  label: string;
  width: number;
  /** Line the panel up with the item's left edge, or its right edge (items near the end of the nav). */
  align: "left" | "right";
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    // The transparent top padding bridges the gap between item and panel, so
    // the pointer never leaves the menu on its way down.
    <div className={`absolute top-full z-50 pt-2 ${align === "left" ? "left-0" : "right-0"}`}>
      <div
        id={`menu-${id}`}
        role="region"
        aria-label={`${label} menu`}
        // Close after any link inside is followed.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onNavigate();
        }}
        style={{ width: `min(${width}px, calc(100vw - 48px))` }}
        className="grid grid-cols-2 gap-x-[22px] gap-y-1.5 rounded-card border border-line-200 bg-white p-5 shadow-menu"
      >
        {children}
      </div>
    </div>
  );
}

type MenuLinkProps = { href: string; icon: IconName; title: string; summary: string };

function MenuLink({ href, icon, title, summary }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className="flex gap-[11px] rounded-input px-2 py-[9px] text-ink-900 hover:bg-navy-050 hover:text-ink-900"
    >
      <Icon name={icon} size={21} className="text-navy-700" />
      <span>
        <span className="block text-[14.5px] font-semibold">{title}</span>
        <span className="block text-[12.5px] text-ink-500">{summary}</span>
      </span>
    </Link>
  );
}

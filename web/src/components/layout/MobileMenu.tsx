"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/Icon";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import { LogoMark } from "./Logo";

type DrawerLink = { href: string; icon: IconName; label: string };

const groups: { heading: string; links: DrawerLink[] }[] = [
  {
    heading: "About",
    links: [
      { href: routes.about, icon: "apartment", label: "About DCH" },
      { href: routes.vision, icon: "flag", label: "Vision & Values" },
      { href: routes.leadership, icon: "groups", label: "Our Staff & Leadership Team" },
      { href: routes.careers, icon: "work", label: "Careers" },
    ],
  },
  {
    heading: "Care",
    links: [
      { href: routes.services, icon: "local_hospital", label: "Services & Departments" },
      { href: routes.doctors, icon: "badge", label: "Doctors Directory" },
      { href: routes.patients, icon: "assignment", label: "Patients & Visitors" },
    ],
  },
  {
    heading: "News & health info",
    links: [
      { href: routes.news, icon: "campaign", label: "News & Announcements" },
      { href: routes.health, icon: "menu_book", label: "Health Information" },
    ],
  },
];

/** Hamburger button + drawer, shown below 960px. */
export function MobileMenu({
  hospitalName,
  emergencyNumber,
}: {
  hospitalName: string;
  emergencyNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const trigger = buttonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // Keep Tab inside the drawer while it is open.
      if (e.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>("a[href], button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Close the drawer if the window grows wide enough for the full menu.
    const wide = window.matchMedia("(min-width: 77.5rem)");
    const onWide = () => wide.matches && setOpen(false);

    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="ml-auto flex size-11 flex-none items-center justify-center rounded-button-lg bg-navy-050 text-navy-700 nav:ml-0 menu:hidden"
      >
        <Icon name="menu" size={26} />
      </button>

      {/* Portalled to <body> so it stacks above the sticky header and the
          mobile action bar (the header's z-index creates a stacking context). */}
      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex flex-col bg-[rgba(10,18,38,0.5)] menu:hidden">
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) close();
            }}
            className="max-h-[calc(100%-16px)] overflow-auto rounded-b-[22px] bg-white px-4 pt-4 pb-6 shadow-menu"
          >
            <div className="flex items-center gap-[11px] border-b border-line-100 pb-3.5">
              <LogoMark size={36} />
              <span className="font-display text-[14.5px] leading-[1.2] font-bold text-navy-700">
                {hospitalName}
              </span>
              <button
                type="button"
                data-autofocus
                aria-label="Close menu"
                onClick={close}
                className="ml-auto flex size-10 flex-none items-center justify-center rounded-button bg-navy-050 text-navy-700"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            <Link
              href={routes.home}
              className="flex items-center gap-3 border-b border-line-050 px-1 py-3.5 text-base font-bold text-ink-900"
            >
              <Icon name="home" size={22} className="text-navy-700" />
              Home
            </Link>

            {groups.map((g) => (
              <div key={g.heading}>
                <div className="px-1 pt-4 pb-1.5 text-[10.5px] font-bold tracking-[1.2px] text-ink-400 uppercase">
                  {g.heading}
                </div>
                {g.links.map((l) => (
                  <DrawerItem key={l.href} {...l} />
                ))}
              </div>
            ))}
            <DrawerItem href={routes.contact} icon="mail" label="Contact" last />

            <Link
              href={routes.book}
              className="mt-4 flex items-center justify-center gap-2 rounded-[12px] bg-navy-700 p-[15px] text-[15.5px] font-bold text-white hover:bg-navy-900 hover:text-white"
            >
              <Icon name="event_available" size={20} />
              Book Appointment
            </Link>
            <div className="mt-3.5 flex gap-4 text-[13.5px]">
              <Link href={routes.careers} className="text-ink-500">
                Careers
              </Link>
              <a href={telHref(emergencyNumber)} className="ml-auto font-semibold text-red-700">
                ER {emergencyNumber}
              </a>
            </div>
          </div>
          {/* Tapping the scrim closes the drawer. */}
          <div className="flex-1" onClick={close} aria-hidden="true" />
        </div>,
        document.body,
      )}
    </>
  );
}

function DrawerItem({ href, icon, label, last }: DrawerLink & { last?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-1 py-3 text-[15.5px] font-semibold text-ink-900 ${last ? "" : "border-b border-line-050"}`}
    >
      <Icon name={icon} size={21} className="text-navy-700" />
      {label}
    </Link>
  );
}

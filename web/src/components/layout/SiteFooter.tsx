import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { getSiteSettings } from "@/lib/cms";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import { LogoMark } from "./Logo";

const columns: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Patients",
    links: [
      { href: routes.book, label: "Book an appointment" },
      { href: `${routes.patients}#admission`, label: "Admission & discharge" },
      { href: `${routes.patients}#billing`, label: "Billing & PhilHealth" },
      { href: `${routes.patients}#visiting-hours`, label: "Visiting hours" },
    ],
  },
  {
    heading: "Hospital",
    links: [
      { href: routes.about, label: "About DCH" },
      { href: routes.services, label: "Services" },
      { href: routes.doctors, label: "Doctors directory" },
      { href: routes.leadership, label: "Our staff & leadership" },
      { href: routes.vision, label: "Vision & values" },
      { href: routes.careers, label: "Careers" },
    ],
  },
];

export async function SiteFooter() {
  const s = await getSiteSettings();
  const { address } = s;

  const social: { href: string; icon: IconName; label: string }[] = [
    { href: s.social.facebook, icon: "public", label: "Facebook" },
    { href: s.social.messenger, icon: "chat", label: "Messenger" },
    { href: `mailto:${s.email}`, icon: "mail", label: `Email ${s.email}` },
  ].filter((l): l is { href: string; icon: IconName; label: string } => Boolean(l.href));

  const contactLines = (
    <>
      <a href={telHref(s.emergencyNumber)} className="font-bold text-white hover:text-gold-300">
        ER: {s.emergencyNumber}
      </a>
      <a href={telHref(s.trunkline)} className="text-on-navy-body hover:text-white">
        Trunkline: {s.trunkline}
      </a>
    </>
  );

  return (
    <footer className="on-navy mt-auto bg-navy-900 text-on-navy-body">
      {/* Phone: compact contact block (from the mobile mockup). */}
      <div className="page-container pt-6 pb-5 nav:hidden">
        <div className="mb-3 flex items-center gap-[11px]">
          <LogoMark size={38} />
          <span className="font-display text-[15px] leading-[1.25] font-bold text-white">{s.hospitalName}</span>
        </div>
        <p className="mb-3.5 text-[13.5px] leading-[1.6]">
          {address.street}, {address.barangay}, {address.town}, {address.postcode} {address.province}
        </p>
        <div className="flex flex-col gap-2 text-[13.5px]">
          {contactLines}
          <a href={`mailto:${s.email}`} className="text-on-navy-body hover:text-white">
            {s.email}
          </a>
        </div>
      </div>

      {/* Desktop: brand, link columns, contact. */}
      <div className="page-container hidden grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 pt-[52px] pb-7 nav:grid">
        <div>
          <div className="mb-3.5 flex items-center gap-3">
            <LogoMark size={48} />
            <span className="max-w-[11em] font-display text-[17px] leading-[1.25] font-bold text-white">
              {s.hospitalName}
            </span>
          </div>
          <p className="mb-4 max-w-[30em] text-[14.5px] leading-[1.6]">{s.summary}</p>
          <div className="flex gap-2.5">
            {social.map((l) => (
              <a
                key={l.icon}
                href={l.href}
                aria-label={l.label}
                className="flex size-[38px] items-center justify-center rounded-input bg-white/10 text-white hover:bg-gold-500 hover:text-gold-900"
              >
                <Icon name={l.icon} size={20} />
              </a>
            ))}
          </div>
        </div>
        {columns.map((c) => (
          <FooterColumn key={c.heading} heading={c.heading}>
            {c.links.map((l) => (
              <Link key={l.label} href={l.href} className="text-on-navy-body hover:text-gold-300">
                {l.label}
              </Link>
            ))}
          </FooterColumn>
        ))}
        <FooterColumn heading="Contact">
          <span>
            {address.street}, {address.barangay}
            <br />
            {address.town}, {address.postcode} {address.province}
          </span>
          {contactLines}
        </FooterColumn>
      </div>

      {/* Accreditation strip */}
      <div className="border-t border-white/12">
        <div className="page-container flex flex-wrap items-center gap-x-8 gap-y-5 py-6">
          <div className="flex flex-[0_1_auto] flex-col gap-1">
            <span className="text-[11px] font-bold tracking-[1.3px] text-gold-500 uppercase">
              Licensed &amp; accredited
            </span>
            <span className="text-[13px] text-on-navy-muted">
              Accreditation no. {s.accreditation.philhealthNumber || "— to be supplied"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AccreditationPlate logoLabel="PhilHealth logo" title="PhilHealth" subtitle="Accredited facility" />
            <AccreditationPlate
              logoLabel="DOH logo"
              title="Department of Health"
              subtitle={`${s.accreditation.dohLicenceLevel} licence`}
            />
          </div>
        </div>
      </div>

      {/* Legal line */}
      <div className="border-t border-white/12">
        <div className="page-container flex flex-wrap gap-4 py-[18px] text-[13px] text-on-navy-muted">
          <span>{s.footerText}</span>
          <span className="flex gap-[18px] nav:ml-auto">
            <Link href={routes.privacy} className="text-on-navy-muted hover:text-white">
              Privacy
            </Link>
            <Link href={routes.patientRights} className="text-on-navy-muted hover:text-white">
              Patient rights
            </Link>
            <Link href={routes.sitemap} className="text-on-navy-muted hover:text-white">
              Sitemap
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mt-0 mb-3.5 text-xs font-bold tracking-[1.3px] text-gold-500 uppercase">{heading}</h2>
      <div className="flex flex-col gap-2.5 text-[14.5px]">{children}</div>
    </div>
  );
}

/**
 * White plate for an accreditation badge. The official PhilHealth and DOH
 * logo files have not been supplied yet, so the logo area is a labelled slot.
 */
function AccreditationPlate({
  logoLabel,
  title,
  subtitle,
}: {
  logoLabel: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-[11px] rounded-button bg-white px-3.5 py-2.5">
      <span className="flex h-[58px] w-[104px] items-center justify-center rounded-tag border border-dashed border-line-300 bg-paper text-center text-xs text-ink-400">
        {logoLabel}
      </span>
      <span className="flex flex-col leading-[1.25]">
        <span className="text-[13.5px] font-bold text-navy-700">{title}</span>
        <span className="text-[11.5px] text-ink-500">{subtitle}</span>
      </span>
    </div>
  );
}

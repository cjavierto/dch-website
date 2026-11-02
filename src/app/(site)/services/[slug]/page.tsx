import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailFallback } from "@/components/DetailFallback";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Checklist, EmergencyCard, Panel } from "@/components/ui/Cards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDoctorsForService, getService, getServices, getSiteSettings } from "@/lib/cms";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return {};
  return { title: service.name, description: service.detail.lead };
}

export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  // Streamed so client navigations show the page frame immediately.
  return (
    <Suspense fallback={<DetailFallback />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}

async function ServiceDetail({ params }: { params: PageProps<"/services/[slug]">["params"] }) {
  const { slug } = await params;
  const [service, settings, doctors] = await Promise.all([getService(slug), getSiteSettings(), getDoctorsForService(slug)]);
  if (!service) notFound();

  const { detail } = service;
  const heroImage = service.image ?? { src: "/images/staff-hallway.png", alt: "" };
  const staff: { name: string; role: string; initials: string; photo?: string }[] =
    detail.staff ?? doctors.map((d) => ({ name: d.name, role: d.specialty, initials: d.initials, photo: d.photo }));
  const isEmergency = Boolean(service.emergency);

  return (
    <>
      {/* Photo hero */}
      <section className="on-navy relative overflow-hidden bg-navy-900">
        <Image src={heroImage.src} alt="" fill loading="eager" sizes="100vw" className="object-cover opacity-35" />
        <div
          aria-hidden="true"
          className="absolute inset-0 [background:linear-gradient(180deg,rgba(14,37,89,0.7),rgba(14,37,89,0.95))] nav:[background:var(--scrim-hero-compact)]"
        />
        <div className="page-container relative pt-5 pb-6 nav:py-14">
          <nav aria-label="Breadcrumb" className="mb-2.5 text-[12.5px] text-on-navy-muted nav:mb-3 nav:text-[13.5px]">
            <Link href={routes.services} className="inline-flex items-center gap-[5px] text-on-navy-muted hover:text-white">
              <Icon name="arrow_back" size={16} className="nav:hidden" />
              Services
            </Link>
            <span className="hidden nav:inline">
              {" "}
              / <span aria-current="page">{service.name}</span>
            </span>
          </nav>
          <span className="inline-flex items-center gap-[7px] rounded-full bg-white/12 px-[11px] py-1.5 text-[11.5px] font-bold text-white nav:gap-2 nav:px-[13px] nav:py-[7px] nav:text-[13px]">
            <Icon name={service.icon} size={17} className="text-gold-500" />
            {service.categoryLabel}
          </span>
          <h1 className="mt-3.5 font-display text-[28px] font-bold tracking-[-0.5px] text-white nav:mt-[18px] nav:text-[44px] nav:tracking-[-0.8px]">
            {service.name}
          </h1>
          <p className="mt-2.5 max-w-[40em] text-[14.5px] leading-[1.55] text-on-navy-body nav:mt-3.5 nav:text-[17.5px]">
            {detail.lead}
          </p>
          <div className="mt-[18px] flex flex-wrap gap-3 nav:mt-[26px]">
            {isEmergency ? (
              <a
                href={telHref(settings.emergencyNumber)}
                className="flex flex-1 items-center justify-center gap-[9px] rounded-[12px] bg-red-700 p-3.5 text-[15.5px] font-bold text-white hover:bg-red-800 hover:text-white nav:flex-none nav:rounded-button-lg nav:px-5 nav:text-[15px]"
              >
                <Icon name="call" size={20} />
                Call the ER · {settings.emergencyNumber}
              </a>
            ) : (
              <Link
                href={routes.book}
                className="flex flex-1 items-center justify-center gap-[9px] rounded-[12px] bg-gold-500 p-3.5 text-[15.5px] font-bold text-gold-900 hover:bg-gold-300 hover:text-gold-900 nav:flex-none nav:rounded-button-lg nav:px-5 nav:text-[15px]"
              >
                <Icon name="event_available" size={20} />
                {detail.ctaLabel ?? "Request an appointment"}
              </Link>
            )}
            <Link
              href={detail.secondaryCta?.href ?? routes.doctors}
              className="hidden items-center gap-[9px] rounded-button-lg border border-white/45 bg-white/10 px-5 py-3.5 text-[15px] font-bold text-white hover:bg-white/20 hover:text-white nav:flex"
            >
              <Icon name="stethoscope" size={20} />
              {detail.secondaryCta?.label ?? "Our doctors"}
            </Link>
          </div>
        </div>
      </section>

      <section className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-6 pt-5 nav:gap-[34px] nav:pt-11 nav:pb-2">
        <div>
          <SectionHeading eyebrow="Overview" size={32}>
            {detail.overview?.heading ?? `About ${service.name}`}
          </SectionHeading>
          <div className="mt-3 flex flex-col gap-3 nav:mt-4 nav:gap-4">
            {(detail.overview?.paragraphs ?? [service.summary]).map((p) => (
              <p key={p} className="text-[15px] leading-[1.65] text-ink-700 nav:text-base nav:leading-[1.7]">
                {p}
              </p>
            ))}
          </div>

          {detail.procedures && (
            <>
              <h3 className="mt-6 mb-3 text-lg font-bold nav:mt-7 nav:mb-3.5 nav:text-xl">Procedures offered</h3>
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-2.5 nav:gap-3">
                {detail.procedures.map((p) => (
                  <li key={p.title} className="flex gap-3 rounded-card border border-line-200 bg-white p-[15px] nav:gap-[11px] nav:rounded-card-lg nav:p-[18px]">
                    <Icon name={p.icon} size={22} className="text-navy-700" />
                    <span>
                      <span className="block text-[15px] font-bold nav:text-[15.5px]">{p.title}</span>
                      <span className="mt-[3px] block text-[13px] text-ink-500 nav:text-[13.5px]">{p.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {detail.preparation && (
            <>
              <h3 className="mt-6 mb-3 text-lg font-bold nav:mt-8 nav:mb-3.5 nav:text-xl">How to prepare</h3>
              <Checklist items={detail.preparation} />
            </>
          )}
        </div>

        <aside className="flex flex-col gap-3 nav:gap-[18px]" aria-label={`${service.name} details`}>
          {detail.schedule && (
            <Panel>
              <h3 className="mb-3 text-[17px] font-bold nav:mb-3.5 nav:text-lg">Schedule &amp; location</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-ink-700 nav:gap-[11px] nav:text-[14.5px]">
                {detail.schedule.map((line) => (
                  <li key={line.text} className="flex gap-[9px]">
                    <Icon name={line.icon} size={19} className="text-ink-400" />
                    {line.text}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {staff.length > 0 && (
            <Panel>
              <h3 className="mb-3.5 text-[17px] font-bold nav:text-lg">{detail.staff ? "Department staff" : "Doctors"}</h3>
              <ul className="flex flex-col gap-[13px] nav:gap-3.5">
                {staff.map((p) => (
                  <li key={p.name} className="flex items-center gap-3 nav:gap-[13px]">
                    <Avatar name={p.name} initials={p.initials} photo={p.photo} size={48} />
                    <div>
                      <div className="text-[15px] font-bold nav:text-[15.5px]">{p.name}</div>
                      <div className="text-[13px] font-semibold text-green-600 nav:text-[13.5px]">{p.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href={routes.doctors} className="mt-4 inline-flex items-center gap-[7px] text-[14.5px] font-bold">
                All doctors
                <Icon name="arrow_forward" size={18} />
              </Link>
            </Panel>
          )}

          <Panel>
            <h3 className="mb-3 text-[17px] font-bold nav:text-lg">Coverage</h3>
            <p className="mb-3 text-[14.5px] leading-[1.6] text-ink-500">
              PhilHealth, accredited HMOs, and senior/PWD discounts are applied at the billing window before you pay.
            </p>
            <Link href={`${routes.patients}#billing`} className="text-[14.5px] font-bold">
              Billing information →
            </Link>
          </Panel>

          {!isEmergency && (
            <EmergencyCard
              title={detail.emergencyTitle ?? "In an emergency"}
              text="Go straight to the ER — no appointment needed."
              emergencyNumber={settings.emergencyNumber}
            />
          )}
        </aside>
      </section>

      {detail.gallery ? (
        <section className="page-container pt-6 pb-8 nav:pt-11 nav:pb-[72px]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3 nav:gap-3.5">
            {detail.gallery.map((img) => (
              <div key={img.src} className="relative h-[170px] overflow-hidden rounded-card nav:h-[190px]">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 60rem) 400px, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="h-8 nav:h-[72px]" />
      )}
    </>
  );
}

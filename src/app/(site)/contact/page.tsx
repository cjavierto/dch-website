import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { getSiteSettings } from "@/lib/cms";
import { DEFAULT_SUBJECT } from "@/lib/contact";
import { telHref } from "@/lib/format";
import { ContactForm } from "./ContactForm";
import { ContactFormWithQuery } from "./ContactFormWithQuery";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Send Deiparine Community Hospital a message — appointment requests, billing and PhilHealth questions, medical records. We reply within one working day.",
};

export default async function ContactPage() {
  const s = await getSiteSettings();
  const { address } = s;

  return (
    <>
      <PageHero
        title="Contact us"
        lead="Appointment requests, billing questions, or anything else — we reply within one working day."
        crumbs={[{ label: "Contact" }]}
      />

      <div className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-3 pt-[18px] pb-2 nav:gap-8 nav:pt-11 nav:pb-[72px]">
        <section className="relative rounded-card-lg border border-line-200 bg-white p-[18px] nav:p-7">
          {/* The static shell renders the default subject; the query-aware
              form takes over as soon as the URL is known. */}
          <Suspense fallback={<ContactForm initialSubject={DEFAULT_SUBJECT} emergencyNumber={s.emergencyNumber} />}>
            <ContactFormWithQuery emergencyNumber={s.emergencyNumber} />
          </Suspense>
        </section>

        <aside className="flex flex-col gap-3 nav:gap-[18px]" aria-label="How to reach us">
          <div className="overflow-hidden rounded-card-lg border border-line-200 bg-white">
            <iframe
              src={s.mapEmbedUrl}
              title={`Map: ${s.hospitalName}, ${address.town}, ${address.province}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[220px] w-full border-0 bg-navy-075 nav:h-[260px]"
            />
            <div className="flex flex-col gap-[11px] p-[18px] text-[14.5px] text-ink-900 nav:gap-[13px] nav:p-[22px] nav:text-[15px]">
              <span className="flex gap-2.5">
                <Icon name="location_on" size={20} className="text-navy-700" />
                <span>
                  {address.street}, {address.barangay},
                  <br />
                  {address.town}, {address.postcode} {address.province}
                </span>
              </span>
              <a href={telHref(s.trunkline)} className="flex items-center gap-2.5 text-ink-900 hover:text-navy-700">
                <Icon name="call" size={20} className="text-navy-700" />
                {s.trunkline}
              </a>
              <a href={`mailto:${s.email}`} className="flex items-center gap-2.5 text-ink-900 hover:text-navy-700">
                <Icon name="mail" size={20} className="text-navy-700" />
                {s.email}
              </a>
              <a
                href={s.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 font-bold text-navy-700 hover:text-navy-900"
              >
                <Icon name="directions" size={20} />
                Get directions
              </a>
            </div>
          </div>

          <div className="on-navy flex items-start gap-3 rounded-card-lg bg-red-700 p-[18px] text-white nav:gap-3.5 nav:p-6">
            <Icon name="emergency" size={28} className="text-red-100" />
            <div>
              <h2 className="mb-[5px] text-[17px] font-bold nav:mb-1.5 nav:text-[19px]">Emergency hotline</h2>
              <p className="mb-[7px] text-[14px] leading-[1.5] text-red-200 nav:mb-2 nav:text-[15px]">
                Ambulance and ER are staffed 24 hours a day.
              </p>
              <a
                href={telHref(s.emergencyNumber)}
                className="font-display text-[19px] font-bold text-white hover:text-red-200 nav:text-[22px]"
              >
                {s.emergencyNumber}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

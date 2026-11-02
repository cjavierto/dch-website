import Link from "next/link";
import { Icon } from "@/components/Icon";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Faq } from "@/lib/types";
import { FaqAccordion } from "./FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FaqSection({ faqs, trunkline }: { faqs: Faq[]; trunkline: string }) {
  return (
    <section aria-labelledby="faq-heading" className="page-container pt-[22px] nav:pt-14 nav:pb-2">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-6 nav:gap-[34px]">
        <div>
          <SectionHeading eyebrow="Common questions" id="faq-heading">
            Before you come in
          </SectionHeading>
          <p className="mt-3.5 mb-5 text-[15px] leading-[1.65] text-ink-700 nav:text-base">
            The things our admitting desk gets asked most. If yours isn&apos;t here, call the
            trunkline or send us a message.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={routes.contact}
              className="flex items-center gap-2 rounded-button bg-navy-700 px-[19px] py-[13px] text-[14.5px] font-bold text-white hover:bg-navy-900 hover:text-white"
            >
              <Icon name="mail" size={19} />
              Ask a question
            </Link>
            <a
              href={telHref(trunkline)}
              className="flex items-center gap-2 rounded-button border border-line-300 px-[19px] py-[13px] text-[14.5px] font-bold text-ink-900 hover:border-navy-700 hover:text-navy-700"
            >
              <Icon name="call" size={19} />
              {trunkline}
            </a>
          </div>
        </div>
        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}

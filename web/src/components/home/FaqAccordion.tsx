"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/Icon";
import type { Faq } from "@/lib/types";

/** Single-open accordion; the first item starts open. Closed answers stay in
    the HTML (hidden) so they are indexable and findable with Ctrl+F. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="flex flex-col gap-2.5">
      {faqs.map((f, i) => {
        const open = openIndex === i;
        const buttonId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div
            key={f.question}
            className={`rounded-card border bg-white transition-[border-color] duration-[180ms] ${open ? "border-navy-700" : "border-line-200"}`}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-start gap-3 rounded-card px-[18px] py-4 text-left text-ink-900 transition-colors duration-[120ms] hover:text-navy-700"
              >
                <span className="flex-1 text-[15.5px] leading-[1.4] font-bold text-pretty">{f.question}</span>
                <Icon
                  name={open ? "remove" : "add"}
                  size={22}
                  className={`mt-px ${open ? "text-navy-700" : "text-ink-400"}`}
                />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
              <p className="px-[18px] pb-[18px] text-[15px] leading-[1.65] text-ink-700 nav:text-[14.5px]">{f.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

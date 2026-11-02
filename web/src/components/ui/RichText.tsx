import type { Block } from "@/lib/types";

/** Renders CMS rich-text blocks in the article style (70ch measure). */
export function RichText({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "lead":
            return (
              <p key={i} className="mb-5 text-[17px] leading-[1.65] font-medium text-ink-900 nav:text-[19px]">
                {b.text}
              </p>
            );
          case "p":
            return (
              <p key={i} className="mb-[18px] text-[15.5px] leading-[1.7] text-ink-700 nav:text-base">
                {b.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={i} className="mt-8 mb-3 font-display text-[22px] font-bold text-ink-900 nav:text-[26px]">
                {b.text}
              </h2>
            );
          case "ul":
            return (
              <ul key={i} className="mb-[18px] flex list-disc flex-col gap-2.5 pl-[22px] text-[15.5px] leading-[1.7] text-ink-700 nav:text-base">
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-[26px] rounded-r-[12px] border-l-4 border-green-600 bg-green-050 px-[22px] py-5 nav:px-[26px] nav:py-[22px]">
                <p className="mb-2.5 text-[17px] leading-[1.6] text-green-900 italic nav:text-lg">{b.text}</p>
                <footer className="text-sm font-bold text-green-600">— {b.cite}</footer>
              </blockquote>
            );
        }
      })}
    </>
  );
}

/** Shown where a post's body has not been written in the CMS yet. */
export function BodyPending({ what }: { what: string }) {
  return (
    <p className="rounded-card border border-dashed border-line-300 bg-white px-5 py-4 text-[14.5px] leading-[1.6] text-ink-500">
      The full {what} is being prepared. For questions in the meantime, send us a message or call the trunkline.
    </p>
  );
}

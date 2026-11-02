import type { ReactNode } from "react";

/** Green eyebrow + serif H2. `size` follows the prototype: 36px for the
    homepage services section, 34px for homepage content sections, 32px on
    inner pages. */
export function SectionHeading({
  eyebrow,
  children,
  size = 34,
  id,
  className = "",
}: {
  eyebrow: string;
  children: ReactNode;
  size?: 32 | 34 | 36;
  id?: string;
  className?: string;
}) {
  const sizes = {
    32: "text-[22px] nav:text-[32px]",
    34: "text-[23px] nav:text-[34px]",
    36: "text-[23px] nav:text-[36px]",
  }[size];
  return (
    <div className={className}>
      <span className="eyebrow text-[11px] tracking-[1.3px] nav:text-xs nav:tracking-[1.4px]">{eyebrow}</span>
      <h2
        id={id}
        className={`mt-[7px] font-display leading-[1.15] font-bold tracking-[-0.3px] text-ink-900 nav:mt-2 nav:tracking-[-0.5px] ${sizes}`}
      >
        {children}
      </h2>
    </div>
  );
}

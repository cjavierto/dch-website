"use client";

/**
 * Single-select pill filter ("All" + options). The selected pill is filled;
 * `accent` picks navy (default) or green (Health Information). Scrolls
 * sideways on phones instead of wrapping onto many lines.
 */
export function FilterChips<T extends string>({
  label,
  allLabel = "All",
  options,
  value,
  onChange,
  accent = "navy",
}: {
  label: string;
  allLabel?: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  accent?: "navy" | "green";
}) {
  const selected = accent === "green" ? "border-green-600 bg-green-600 text-white" : "border-navy-700 bg-navy-700 text-white";
  const chip = (active: boolean) =>
    `flex-none rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-[120ms] nav:px-4 nav:py-[9px] nav:text-sm ${
      active ? selected : "border-line-200 bg-white text-ink-700 hover:border-navy-700 hover:text-navy-700"
    }`;

  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden nav:mx-0 nav:flex-wrap nav:gap-[9px] nav:overflow-visible nav:px-0 nav:pb-0"
    >
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={chip(value === null)}>
        {allLabel}
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={chip(value === o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

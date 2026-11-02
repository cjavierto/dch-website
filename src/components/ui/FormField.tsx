import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

/** Text input / select / textarea styling, with the error border. */
export function inputClass(invalid: boolean) {
  return `rounded-input border bg-white px-[13px] py-3 text-[15px] font-normal text-ink-900 placeholder:text-ink-400 transition-colors duration-[120ms] focus:border-navy-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-navy-700 ${
    invalid ? "border-red-700" : "border-line-300"
  }`;
}

/** id/name/aria wiring for a form control. `prefix` keeps ids unique per form. */
export function fieldProps<F extends string>(prefix: string, field: F, errors: Partial<Record<F, string>>) {
  const invalid = Boolean(errors[field]);
  return {
    id: `${prefix}-${field}`,
    name: field,
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${prefix}-${field}-error` : undefined,
    className: inputClass(invalid),
  };
}

/** Label + control + inline error. */
export function Field({
  prefix,
  id,
  label,
  error,
  wide,
  children,
}: {
  prefix: string;
  id: string;
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 nav:gap-[7px] ${wide ? "col-span-full" : ""}`}>
      <label htmlFor={`${prefix}-${id}`} className="text-[13px] font-semibold text-ink-700 nav:text-[13.5px]">
        {label}
      </label>
      {children}
      <FieldError id={`${prefix}-${id}-error`} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-[13px] leading-[1.45] text-red-700">
      <Icon name="error" size={17} className="mt-px" />
      {error}
    </p>
  );
}

/** Hidden field bots fill in and people never see. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

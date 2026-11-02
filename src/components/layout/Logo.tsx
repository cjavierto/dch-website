import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

/** Circular raster mark. Swap for the vector logo once the hospital sends it. */
export function LogoMark({ size, className = "" }: { size: number; className?: string }) {
  return (
    <Image
      src="/images/dch-logo.jpg"
      alt=""
      width={size}
      height={size}
      className={`block flex-none rounded-full ${className}`}
    />
  );
}

/** Header lockup: mark + hospital name + tagline. */
export function HeaderLogo({
  name,
  tagline,
  taglineShort,
}: {
  name: string;
  tagline: string;
  taglineShort: string;
}) {
  return (
    <Link
      href={routes.home}
      className="flex min-w-0 flex-[0_1_auto] items-center gap-[11px] nav:gap-[13px]"
      aria-label={`${name} — home`}
    >
      <LogoMark size={56} className="hidden nav:block" />
      <LogoMark size={40} className="nav:hidden" />
      <span className="flex min-w-0 flex-col leading-[1.15]">
        <span className="font-display text-[15px] font-bold text-navy-700 nav:text-[19px] nav:tracking-[-0.2px] menu:text-[18px] menu:whitespace-nowrap">
          {name}
        </span>
        <span className="text-[9.5px] font-bold tracking-[1.1px] text-green-600 uppercase nav:hidden">
          {taglineShort}
        </span>
        <span className="hidden text-[11.5px] font-semibold tracking-[1.3px] text-green-600 uppercase nav:block">
          {tagline}
        </span>
      </span>
    </Link>
  );
}

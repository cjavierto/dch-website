import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { routes } from "@/lib/routes";

export function Hero({ licence }: { licence: string }) {
  return (
    <section className="on-navy relative overflow-hidden bg-navy-900">
      <Image
        src="/images/staff-hallway.png"
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className="object-cover opacity-40 nav:opacity-42"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:var(--scrim-hero-mobile)] nav:[background:var(--scrim-hero)]"
      />
      <div className="page-container relative pt-[26px] pb-[30px] nav:pt-[84px] nav:pb-[72px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/50 bg-gold-500/16 px-[11px] py-1.5 text-[10.5px] font-bold tracking-[1px] text-gold-300 uppercase nav:gap-2 nav:px-[13px] nav:py-[7px] nav:text-[12.5px] nav:tracking-[1.1px]">
          <Icon name="shield" size={16} />
          {licence} · DOH Licensed
        </span>
        <h1 className="mt-4 max-w-[16em] font-display text-[31px] leading-[1.12] font-bold tracking-[-0.6px] text-pretty text-white nav:mt-[22px] nav:text-[56px] nav:leading-[1.06] nav:tracking-[-1px]">
          Compassionate care, close to home.
        </h1>
        <p className="mt-3 max-w-[34em] text-[15.5px] leading-[1.55] text-on-navy-body nav:mt-[18px] nav:text-[19px]">
          Fifty years of serving Sibonga and southern Cebu — emergency, maternity, surgery, and
          diagnostics under one roof.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 nav:mt-8">
          <Link
            href={routes.book}
            className="flex flex-1 items-center justify-center gap-[9px] rounded-[12px] bg-gold-500 p-[15px] text-base font-bold text-gold-900 hover:bg-gold-300 hover:text-gold-900 nav:flex-none nav:rounded-button-lg nav:px-[22px] nav:text-[15.5px]"
          >
            <Icon name="event_available" size={20} />
            Book an appointment
          </Link>
          <Link
            href={routes.doctors}
            className="hidden items-center gap-[9px] rounded-button-lg border border-white/45 bg-white/10 px-[22px] py-[15px] text-[15.5px] font-bold text-white hover:bg-white/20 hover:text-white nav:flex"
          >
            <Icon name="stethoscope" size={20} />
            Our doctors
          </Link>
        </div>
      </div>
    </section>
  );
}

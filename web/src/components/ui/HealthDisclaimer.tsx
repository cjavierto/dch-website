import { Icon } from "@/components/Icon";
import { telHref } from "@/lib/format";

/** Required at the end of every page that gives health guidance. */
export function HealthDisclaimer({ emergencyNumber }: { emergencyNumber: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-card-lg border border-gold-100 bg-gold-050 p-5 nav:p-[26px]">
      <Icon name="info" size={28} className="text-gold-800" />
      <p className="flex-[1_1_280px] text-[15px] leading-[1.6] text-gold-700 nav:text-[15.5px]">
        These articles are general health information, not a diagnosis. If symptoms are severe or worsening, go to the
        emergency room or call{" "}
        <a href={telHref(emergencyNumber)} className="font-bold whitespace-nowrap text-gold-800 hover:text-gold-900">
          {emergencyNumber}
        </a>
        .
      </p>
    </div>
  );
}

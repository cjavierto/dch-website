import Link from "next/link";
import { Icon } from "@/components/Icon";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { SiteSettings } from "@/lib/types";

/** Navy strip above the desktop header. Hidden below 960px, where the
    mobile action bar keeps the ER number one tap away instead. */
export function UtilityBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="on-navy hidden bg-navy-900 text-[13px] text-on-navy-bar nav:block">
      <div className="page-container flex flex-wrap items-center gap-5 py-2">
        <a
          href={telHref(settings.emergencyNumber)}
          className="flex items-center gap-[7px] font-semibold text-white hover:text-gold-300"
        >
          <Icon name="emergency" size={17} className="text-gold-500" />
          Emergency 24/7 · {settings.emergencyNumber}
        </a>
        <a
          href={telHref(settings.trunkline)}
          className="flex items-center gap-[7px] text-on-navy-bar hover:text-white"
        >
          <Icon name="call" size={17} className="text-on-navy-icon" />
          Trunkline {settings.trunkline}
        </a>
        <span className="flex items-center gap-[7px]">
          <Icon name="location_on" size={17} className="text-on-navy-icon" />
          {settings.address.barangay}, {settings.address.town}, {settings.address.province}
        </span>
        <span className="flex items-center gap-[7px]">
          <Icon name="verified" size={17} className="text-on-navy-icon" />
          PhilHealth Accredited
        </span>
        <span className="ml-auto flex items-center gap-4">
          <Link href={routes.careers} className="text-on-navy-bar hover:text-white">
            Careers
          </Link>
          <Link href={routes.contact} className="text-on-navy-bar hover:text-white">
            Contact
          </Link>
        </span>
      </div>
    </div>
  );
}

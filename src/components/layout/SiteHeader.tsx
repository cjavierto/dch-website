import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getMegaMenuServices, getSiteSettings } from "@/lib/cms";
import { routes } from "@/lib/routes";
import { DesktopNav } from "./DesktopNav";
import { HeaderLogo } from "./Logo";
import { MobileActionBar } from "./MobileActionBar";
import { MobileMenu } from "./MobileMenu";
import { UtilityBar } from "./UtilityBar";

export async function SiteHeader() {
  const [settings, services] = await Promise.all([getSiteSettings(), getMegaMenuServices()]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[80] rounded-button bg-navy-700 px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <UtilityBar settings={settings} />
      <header className="sticky top-0 z-40 border-b border-line-200 bg-white">
        <div className="page-container flex items-center gap-x-3 pt-2 pb-3 nav:gap-x-5 nav:py-3">
          <HeaderLogo
            name={settings.hospitalName}
            tagline={settings.tagline}
            taglineShort={`${settings.address.town}, ${settings.address.province}`}
          />
          <DesktopNav
            outpatientHours={settings.outpatientHours}
            services={services.map((s) => ({
              href: routes.service(s.slug),
              name: s.menuName ?? s.name,
              icon: s.icon,
              summary: s.menuSummary ?? "",
            }))}
          />
          {/* Medium screens (960–1240px): the full menu doesn't fit, so the menu
              button opens the drawer — keep the main CTA visible beside it. */}
          <Link
            href={routes.book}
            className="ml-auto hidden items-center gap-2 rounded-button bg-navy-700 px-4 py-3 text-[14.5px] font-bold whitespace-nowrap text-white hover:bg-navy-900 hover:text-white nav:flex menu:hidden"
          >
            <Icon name="event_available" size={19} />
            Book Appointment
          </Link>
          <MobileMenu
            hospitalName={settings.hospitalName}
            emergencyNumber={settings.emergencyNumber}
          />
        </div>
      </header>
      <MobileActionBar emergencyNumber={settings.emergencyNumber} />
    </>
  );
}

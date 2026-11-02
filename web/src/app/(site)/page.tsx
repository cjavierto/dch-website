import { FacilitySection } from "@/components/home/FacilitySection";
import { FaqSection } from "@/components/home/FaqSection";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SpotlightAndNews } from "@/components/home/SpotlightAndNews";
import { StatsStrip } from "@/components/home/StatsStrip";
import {
  getFaqs,
  getHomepageServices,
  getHomepageSettings,
  getLatestNews,
  getSiteSettings,
} from "@/lib/cms";

export default async function HomePage() {
  const [settings, home, services, faqs, news] = await Promise.all([
    getSiteSettings(),
    getHomepageSettings(),
    getHomepageServices(),
    getFaqs(),
    getLatestNews(3),
  ]);

  return (
    <>
      <Hero licence={settings.accreditation.dohLicenceLevel} />
      <QuickActions emergencyNumber={settings.emergencyNumber} />
      <ServicesSection services={services} />
      {home.showStats && <StatsStrip stats={home.stats} />}
      <FacilitySection />
      <FaqSection faqs={faqs} trunkline={settings.trunkline} />
      <SpotlightAndNews hospitalName={settings.hospitalName} news={news} />
    </>
  );
}

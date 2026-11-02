import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { HealthDisclaimer } from "@/components/ui/HealthDisclaimer";
import { getArticles, getSiteSettings } from "@/lib/cms";
import { ArticleList } from "./ArticleList";

export const metadata: Metadata = {
  title: "Health Information",
  description: "Plain-language health guides written by the doctors and nurses of Deiparine Community Hospital.",
};

export default async function HealthPage() {
  const [articles, settings] = await Promise.all([getArticles(), getSiteSettings()]);

  return (
    <>
      <PageHero
        title="Health Information"
        lead="Plain-language guides written by our own doctors and nurses — for prevention, not self-diagnosis."
        crumbs={[{ label: "Health Information" }]}
      />
      <section className="page-container pt-3.5 nav:pt-10 nav:pb-2">
        <ArticleList articles={articles} />
      </section>
      <section className="page-container pt-6 pb-8 nav:pt-10 nav:pb-[72px]">
        <HealthDisclaimer emergencyNumber={settings.emergencyNumber} />
      </section>
    </>
  );
}

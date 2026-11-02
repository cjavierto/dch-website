import { PageHero } from "@/components/PageHero";
import { EmergencyCard, NavyPanel } from "@/components/ui/Cards";
import { RichText } from "@/components/ui/RichText";
import type { LegalPage as LegalPageData } from "@/lib/cms";
import { formatDateLong } from "@/lib/format";
import { routes } from "@/lib/routes";

/** Shared template for the Privacy notice and Patient rights pages. */
export function LegalPage({
  title,
  page,
  emergencyNumber,
}: {
  title: string;
  page: LegalPageData;
  emergencyNumber: string;
}) {
  return (
    <>
      <PageHero title={title} lead={page.intro} crumbs={[{ label: title }]} />
      <section className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-start gap-8 pt-6 pb-8 nav:gap-10 nav:pt-11 nav:pb-[72px]">
        <article className="max-w-[70ch] rounded-card-lg border border-line-200 bg-white p-[18px] nav:p-[30px] [&>h2:first-child]:mt-0">
          <RichText blocks={page.body} />
          {page.lastUpdated && (
            <p className="mt-6 border-t border-line-100 pt-4 text-[13.5px] text-ink-400">
              Last updated <time dateTime={page.lastUpdated}>{formatDateLong(page.lastUpdated)}</time>
            </p>
          )}
        </article>
        <aside className="flex flex-col gap-3 nav:gap-[18px]">
          <NavyPanel icon="mail" title="Questions?" link={{ href: routes.contact, label: "Send us a message" }}>
            Our staff reply within one working day.
          </NavyPanel>
          <EmergencyCard
            title="In an emergency"
            text="Go straight to the ER — no appointment needed."
            emergencyNumber={emergencyNumber}
          />
        </aside>
      </section>
    </>
  );
}

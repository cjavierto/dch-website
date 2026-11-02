import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { getSitemap } from "@/lib/sitemap";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page on the Deiparine Community Hospital website.",
};

export default async function SitemapPage() {
  const groups = await getSitemap();

  return (
    <>
      <PageHero title="Sitemap" lead="Every page on this website, in one place." crumbs={[{ label: "Sitemap" }]} />
      <section className="page-container pt-6 pb-8 nav:pt-11 nav:pb-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] items-start gap-3 nav:gap-[18px]">
          {groups.map((g) => (
            <nav
              key={g.heading}
              aria-label={g.heading}
              className="rounded-card border border-line-200 bg-white p-[18px] nav:rounded-card-lg nav:p-6"
            >
              <h2 className="mb-3.5 text-xs font-bold tracking-[1.3px] text-green-600 uppercase">{g.heading}</h2>
              <ul className="flex flex-col gap-2.5">
                {g.links.map((l, i) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`text-[15px] leading-[1.45] ${i === 0 ? "font-bold" : "font-semibold text-ink-900 hover:text-navy-700"}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </section>
    </>
  );
}

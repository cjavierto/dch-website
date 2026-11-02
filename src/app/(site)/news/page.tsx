import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { Tag } from "@/components/ui/Tag";
import { getNewsPosts } from "@/lib/cms";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { NewsList } from "./NewsList";

export const metadata: Metadata = {
  title: "News & Announcements",
  description: "Advisories, service updates, and community programmes from Deiparine Community Hospital.",
};

export default async function NewsPage() {
  const posts = await getNewsPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => p !== featured);

  return (
    <>
      <PageHero
        title="News & Announcements"
        lead="Advisories, service updates, and community programmes from DCH."
        crumbs={[{ label: "News & Announcements" }]}
      />

      {featured && (
        <section className="page-container pt-[18px] nav:pt-10 nav:pb-2">
          <Link
            href={routes.newsPost(featured.slug)}
            className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] overflow-hidden rounded-card-lg border border-line-200 bg-white text-ink-900 hover:border-navy-700 hover:text-ink-900"
          >
            <div className="relative min-h-[200px] nav:min-h-[260px]">
              <Image src={featured.cover.src} alt="" fill loading="eager" sizes="(min-width: 60rem) 620px, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-5 nav:p-[34px]">
              <div className="mb-3 flex items-center gap-2.5">
                <Tag label="Featured" tone="notice" upper />
                <time dateTime={featured.publishedAt} className="text-[13px] font-semibold text-ink-400">
                  {formatDate(featured.publishedAt)}
                </time>
              </div>
              <h2 className="mb-3 font-display text-[23px] leading-[1.2] font-bold nav:text-[30px]">{featured.title}</h2>
              <p className="mb-4 text-[15px] leading-[1.7] text-ink-700 nav:text-base">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-[7px] text-[15px] font-bold text-navy-700">
                Read the announcement
                <Icon name="arrow_forward" size={19} />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="page-container pt-6 pb-8 nav:pt-8 nav:pb-[72px]">
        <NewsList posts={rest} />
      </section>
    </>
  );
}

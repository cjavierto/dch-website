import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { NewsPost } from "@/lib/types";

export function SpotlightAndNews({ hospitalName, news }: { hospitalName: string; news: NewsPost[] }) {
  return (
    <section className="page-container pt-[22px] pb-[26px] nav:pt-14 nav:pb-[72px]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-[22px] nav:gap-6">
        {/* Medical Director spotlight */}
        <article className="flex flex-col overflow-hidden rounded-card-lg border border-line-200 bg-white">
          <div className="relative h-[230px] nav:h-[300px]">
            <Image
              src="/images/dr-james-deiparine.png"
              alt="Dr. James Deiparine"
              fill
              sizes="(min-width: 60rem) 600px, 100vw"
              className="object-cover object-[center_18%]"
            />
          </div>
          <div className="p-[18px] nav:p-6">
            <span className="eyebrow text-[11px] tracking-[1.3px] nav:text-xs nav:tracking-[1.4px]">Doctor spotlight</span>
            <h2 className="mt-[7px] mb-[3px] font-display text-[22px] font-bold text-ink-900 nav:mt-2 nav:mb-1 nav:text-[26px]">
              Dr. James Deiparine
            </h2>
            <p className="mb-2.5 text-[13.5px] text-ink-500 nav:mb-3.5 nav:text-[14.5px]">Medical Director, {hospitalName}</p>
            <p className="mb-3.5 text-[15px] leading-[1.6] text-ink-700 nav:mb-[18px]">
              Leads the hospital&apos;s medical staff and clinical services, continuing the family&apos;s
              five decades of care in Sibonga.
            </p>
            <Link href={routes.leadership} className="inline-flex items-center gap-[7px] text-[15px] font-bold">
              Meet the leadership team
              <Icon name="arrow_forward" size={19} />
            </Link>
          </div>
        </article>

        {/* Latest announcements */}
        <div aria-labelledby="news-heading" role="region" className="flex flex-col gap-2.5 nav:gap-4">
          <div className="flex items-baseline gap-3.5">
            <h2 id="news-heading" className="font-display text-[23px] font-bold text-ink-900 nav:text-[28px]">
              Announcements
            </h2>
            <Link href={routes.news} className="ml-auto text-sm font-bold nav:text-[14.5px]">
              All news
            </Link>
          </div>
          {news.map((n) => (
            <Link
              key={n.slug}
              href={routes.newsPost(n.slug)}
              className="flex gap-[13px] rounded-card border border-line-200 bg-white p-[15px] text-ink-900 hover:border-navy-700 hover:text-ink-900 nav:gap-4 nav:p-5"
            >
              <Icon name={n.icon} size={26} className="text-navy-700" />
              <div>
                <time dateTime={n.publishedAt} className="block text-xs font-semibold text-ink-400 nav:text-[12.5px]">
                  {formatDate(n.publishedAt)}
                </time>
                <h3 className="mt-[3px] mb-1 text-[15.5px] leading-[1.3] font-bold nav:mb-[5px] nav:text-[17px]">{n.title}</h3>
                <p className="text-[14px] leading-[1.55] text-ink-500 nav:text-[14.5px]">{n.excerptShort ?? n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

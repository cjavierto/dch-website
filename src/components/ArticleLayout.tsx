import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";
import type { Image as ImageData } from "@/lib/types";

/**
 * Shared template for News and Health Information detail pages: narrow navy
 * header, cover photo overlapping it, article column (70ch) and a sidebar.
 */
export function ArticleLayout({
  crumb,
  category,
  title,
  meta,
  cover,
  coverCaption,
  children,
  aside,
}: {
  crumb: { label: string; href: string };
  category: string;
  title: string;
  meta: { icon: IconName; text: string; dateTime?: string }[];
  cover: ImageData;
  coverCaption?: string;
  children: ReactNode;
  aside: ReactNode;
}) {
  return (
    <>
      <section className="on-navy bg-navy-900">
        <div className="page-container pt-5 pb-10 nav:pt-[52px] nav:pb-[60px]">
          <div className="max-w-[860px]">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs text-on-navy-muted nav:mb-3.5 nav:text-[13.5px]">
              <Link href={crumb.href} className="text-on-navy-muted hover:text-white">
                {crumb.label}
              </Link>{" "}
              / <span>{category}</span>
            </nav>
            <h1 className="font-display text-[27px] leading-[1.15] font-bold tracking-[-0.5px] text-white nav:text-[42px] nav:tracking-[-0.8px]">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-[18px] gap-y-2 text-[13.5px] text-on-navy-body nav:mt-5 nav:text-sm">
              {meta.map((m) => (
                <span key={m.text} className="flex items-center gap-2">
                  <Icon name={m.icon} size={18} className="text-on-navy-icon" />
                  {m.dateTime ? <time dateTime={m.dateTime}>{m.text}</time> : m.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container">
        <figure className="mx-auto max-w-[1000px]">
          <div className="relative -mt-7 h-[210px] overflow-hidden rounded-card-lg shadow-[var(--shadow-media)] nav:h-[380px]">
            <Image src={cover.src} alt={cover.alt} fill loading="eager" sizes="(min-width: 60rem) 1000px, 100vw" className="object-cover" />
          </div>
          {coverCaption && <figcaption className="mt-3 text-[13px] text-ink-400">{coverCaption}</figcaption>}
        </figure>
      </section>

      <section className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-start gap-8 pt-7 pb-8 nav:gap-10 nav:pt-10 nav:pb-[72px]">
        <article className="max-w-[70ch]">{children}</article>
        <aside className="flex flex-col gap-3 nav:gap-[18px]">{aside}</aside>
      </section>
    </>
  );
}

/** "Related" list for the article sidebar. */
export function RelatedLinks({
  title,
  items,
}: {
  title: string;
  items: { href: string; title: string; meta: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-card border border-line-200 bg-white p-5 nav:rounded-card-lg nav:p-6">
      <h2 className="mb-3.5 text-[17px] font-bold">{title}</h2>
      <ul className="flex flex-col gap-3.5">
        {items.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="text-[15px] leading-[1.45] font-semibold text-ink-900 hover:text-navy-700">
              {r.title}
              <span className="mt-1 block text-[12.5px] font-semibold text-ink-400">{r.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

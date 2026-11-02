"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Tag } from "@/components/ui/Tag";
import { FilterChips } from "@/components/ui/FilterChips";
import { formatDate, newsCategoryTag } from "@/lib/format";
import { routes } from "@/lib/routes";
import { NEWS_CATEGORIES, type NewsCategory, type NewsPost } from "@/lib/types";

export function NewsList({ posts }: { posts: NewsPost[] }) {
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const shown = category ? posts.filter((p) => p.category === category) : posts;

  return (
    <>
      <div className="mb-4 nav:mb-[26px]">
        <FilterChips label="Filter news" options={NEWS_CATEGORIES} value={category} onChange={setCategory} />
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} posts
      </p>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-3.5 nav:gap-5">
        {shown.map((p) => (
          <li key={p.slug}>
            <Link
              href={routes.newsPost(p.slug)}
              className="flex h-full flex-col overflow-hidden rounded-card-lg border border-line-200 bg-white text-ink-900 hover:border-navy-700 hover:text-ink-900"
            >
              <div className="relative h-[150px] nav:h-[170px]">
                <Image src={p.cover.src} alt="" fill sizes="(min-width: 60rem) 400px, 100vw" className="object-cover" />
              </div>
              <div className="p-4 nav:p-5">
                <div className="mb-2 flex items-center gap-2.5">
                  <Tag label={newsCategoryTag(p.category)} tone="info" upper />
                  <time dateTime={p.publishedAt} className="text-[12.5px] font-semibold text-ink-400">
                    {formatDate(p.publishedAt)}
                  </time>
                </div>
                <h2 className="mb-[7px] text-[17px] leading-[1.35] font-bold nav:text-lg">{p.title}</h2>
                <p className="text-sm leading-[1.55] text-ink-500 nav:text-[14.5px]">{p.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

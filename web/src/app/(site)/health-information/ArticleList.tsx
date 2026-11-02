"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FilterChips } from "@/components/ui/FilterChips";
import { articleCategoryLabel } from "@/lib/format";
import { routes } from "@/lib/routes";
import { ARTICLE_CATEGORIES, type Article, type ArticleCategory } from "@/lib/types";

export function ArticleList({ articles }: { articles: Article[] }) {
  const [category, setCategory] = useState<ArticleCategory | null>(null);
  const shown = category ? articles.filter((a) => a.category === category) : articles;

  return (
    <>
      <div className="mb-4 nav:mb-7">
        <FilterChips
          label="Filter by topic"
          allLabel="All topics"
          accent="green"
          options={ARTICLE_CATEGORIES}
          value={category}
          onChange={setCategory}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} articles
      </p>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-3.5 nav:gap-5">
        {shown.map((a) => (
          <li key={a.slug}>
            <Link
              href={routes.healthArticle(a.slug)}
              className="flex h-full flex-col overflow-hidden rounded-card-lg border border-line-200 bg-white text-ink-900 hover:border-green-600 hover:text-ink-900"
            >
              <div className="relative h-[150px] nav:h-[160px]">
                <Image src={a.cover.src} alt="" fill sizes="(min-width: 60rem) 400px, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4 nav:p-5">
                <span className="text-[11.5px] font-bold tracking-[1.2px] text-green-600 uppercase">
                  {articleCategoryLabel(a.category)}
                </span>
                <h2 className="text-[17px] leading-[1.35] font-bold nav:text-[17.5px]">{a.title}</h2>
                <p className="text-sm leading-[1.55] text-ink-500 nav:text-[14.5px]">{a.excerpt}</p>
                <span className="mt-auto pt-2.5 text-[13px] text-ink-400">{a.author}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

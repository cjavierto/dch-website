import { ARTICLE_CATEGORIES, NEWS_CATEGORIES, type ArticleCategory, type Block, type NewsCategory } from "@/lib/types";

/** "(032) 484 1234" → "tel:+63324841234". Assumes a Philippine number. */
export function telHref(display: string) {
  let digits = display.replace(/\D/g, "");
  if (digits.startsWith("63")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `tel:+63${digits}`;
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Manila",
});

/** "2026-09-02" → "Sep 2, 2026" */
export function formatDate(iso: string) {
  return dateFormat.format(new Date(`${iso}T00:00:00+08:00`));
}

/** "service-update" → "Service update" */
export function newsCategoryTag(category: NewsCategory) {
  return NEWS_CATEGORIES.find((c) => c.value === category)!.tag;
}

export function articleCategoryLabel(category: ArticleCategory) {
  return ARTICLE_CATEGORIES.find((c) => c.value === category)!.label;
}

/** "2026-09-08" → "September 8, 2026" */
export function formatDateLong(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${iso}T00:00:00+08:00`));
}

/** Reading time at ~200 words a minute, at least 1. */
export function readingMinutes(blocks: Block[]) {
  const words = blocks
    .flatMap((b) => ("items" in b ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

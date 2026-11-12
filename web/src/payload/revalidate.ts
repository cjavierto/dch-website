/**
 * Payload hooks that expire the public site's "use cache" entries
 * (see cacheTag calls in src/lib/cms.ts) when content changes.
 */
import { expireTags } from "@/lib/cacheTags";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

/** Every tag used in src/lib/cms.ts. */
export const ALL_TAGS = ["site-settings", "homepage", "faqs", "pages", "services", "doctors", "staff", "news", "articles", "jobs", "legal"];

export function expire(tags: string[], req: PayloadRequest) {
  // The seed script runs outside Next.js, where there is no cache to expire.
  if (req.context.skipRevalidate) return;
  try {
    // Expired now → the next visit renders fresh content, so editors see
    // their change straight away (in every server process; see lib/cacheTags).
    expireTags(tags);
  } catch (err) {
    req.payload.logger.warn(`Cache refresh for ${tags.join(", ")} skipped: ${(err as Error).message}`);
  }
}

export function revalidateCollection(...tags: string[]): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    afterChange: [({ doc, req }) => (expire(tags, req), doc)],
    afterDelete: [({ doc, req }) => (expire(tags, req), doc)],
  };
}

export function revalidateGlobal(...tags: string[]): GlobalAfterChangeHook[] {
  return [({ doc, req }) => (expire(tags, req), doc)];
}

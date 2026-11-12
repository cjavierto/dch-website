/**
 * Expiring cache tags so every server process sees it, even after a restart.
 *
 * Next.js remembers expired tags in memory only. On the shared hosting,
 * Passenger runs several Node processes and stops idle ones, so an edit
 * expired in one process was forgotten by the others and after a restart,
 * and pages fell back to the build-time snapshot (made from the starter
 * content). So each expiry is also written to a small JSON file next to the
 * database; server.js loads it into every process before handling a request.
 *
 * The file's location must match server.js → tagsFile().
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { revalidateTag } from "next/cache";

export function tagsFile() {
  if (process.env.CACHE_TAGS_FILE) return path.resolve(process.env.CACHE_TAGS_FILE);
  const db = process.env.DATABASE_URL?.match(/^file:(.+)$/)?.[1];
  return path.resolve(db ? path.dirname(db) : "data", "cache-tags.json");
}

function persist(tags: string[], at: number) {
  const file = tagsFile();
  let saved: Record<string, number> = {};
  try {
    saved = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    // First write, or an unreadable file: start again.
  }
  for (const tag of tags) saved[tag] = at;
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(saved));
  renameSync(tmp, file);
}

/** Expires the tags now, here and (through the file) in every other process. */
export function expireTags(tags: string[]) {
  const at = Date.now();
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch (err) {
      // Outside a request (e.g. a script); the file below still reaches the server.
      console.warn(`revalidateTag("${tag}") skipped: ${(err as Error).message}`);
    }
  }
  try {
    persist(tags, at);
  } catch (err) {
    console.error(`Could not save expired cache tags: ${(err as Error).message}`);
  }
}

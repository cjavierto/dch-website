/**
 * Production server for Namecheap's cPanel "Setup Node.js App" (Phusion
 * Passenger), loaded through server.cjs (the configured startup file).
 * Passenger routes the domain's traffic to it; the port
 * it passes in PORT is ignored by Passenger's own listener, so any value works.
 * Locally, use `npm run dev` / `npm start` instead.
 */
import { readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import next from "next";

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: import.meta.dirname });
const handle = app.getRequestHandler();

// ---- Shared cache refreshes ------------------------------------------------------
// Next.js keeps expired cache tags in memory, per process. Passenger runs
// several processes and restarts idle ones, so admin edits (and the deploy
// refresh) are also saved to a file (src/lib/cacheTags.ts) and loaded here
// into this process's list before each request.

const require = createRequire(import.meta.url);
const { tagsManifest } = require("next/dist/server/lib/incremental-cache/tags-manifest.external.js");

/** Same location as tagsFile() in src/lib/cacheTags.ts. */
function tagsFile() {
  if (process.env.CACHE_TAGS_FILE) return path.resolve(process.env.CACHE_TAGS_FILE);
  const db = process.env.DATABASE_URL?.match(/^file:(.+)$/)?.[1];
  return path.resolve(db ? path.dirname(db) : "data", "cache-tags.json");
}

const file = tagsFile();
let seenVersion = "";

function loadExpiredTags() {
  let version;
  try {
    const s = statSync(file);
    version = `${s.mtimeMs}:${s.size}`;
  } catch {
    return; // nothing expired yet
  }
  if (version === seenVersion) return;
  try {
    const saved = JSON.parse(readFileSync(file, "utf8"));
    for (const [tag, at] of Object.entries(saved)) {
      const entry = tagsManifest.get(tag);
      if (typeof at === "number" && !(entry?.expired >= at)) tagsManifest.set(tag, { ...entry, stale: at, expired: at });
    }
    seenVersion = version;
  } catch (err) {
    console.error(`Could not read ${file}: ${err.message}`);
  }
}

await app.prepare();
createServer((req, res) => {
  loadExpiredTags();
  return handle(req, res);
}).listen(port, () => {
  console.log(`DCH website ready on port ${port}`);
});

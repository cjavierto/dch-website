/**
 * Re-processes images uploaded before Media had resizeOptions/formatOptions,
 * so they get the same treatment as new uploads (max 2400px, WebP). The
 * media id stays the same, so every page and setting that uses an image
 * keeps working; only its file name changes (photo.png → photo.webp).
 *
 * Run from the admin while signed in: open /api/media/optimize-existing.
 * Works in small batches to stay inside shared hosting's request time limit;
 * open the URL again until it reports nothing remaining.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Payload, PayloadRequest } from "payload";

const MAX_SIDE = 2400;
/** WebP files at most this big are left alone (re-encoding loses quality). */
const WEBP_OK_BYTES = 1_000_000;
const RESIZABLE = ["image/jpeg", "image/png", "image/webp", "image/tiff", "image/avif"];

type MediaDoc = {
  id: number;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  sizes?: { thumbnail?: { mimeType?: string | null } | null } | null;
};

export function needsOptimizing(m: MediaDoc) {
  if (!m.filename || !m.mimeType || !RESIZABLE.includes(m.mimeType)) return false;
  if (m.mimeType !== "image/webp") return true;
  const tooLarge = Math.max(m.width ?? 0, m.height ?? 0) > MAX_SIDE;
  // Admin thumbnails used to be made as PNG (~300 KB each).
  const oldThumbnail = Boolean(m.sizes?.thumbnail?.mimeType) && m.sizes?.thumbnail?.mimeType !== "image/webp";
  return tooLarge || (m.filesize ?? 0) > WEBP_OK_BYTES || oldThumbnail;
}

export async function optimizeExistingMedia(payload: Payload, req: PayloadRequest, batchSize = 5) {
  const { docs } = await payload.find({ collection: "media", depth: 0, limit: 0, pagination: false, req });
  const pending = (docs as MediaDoc[]).filter(needsOptimizing);
  const staticDir = path.resolve(process.cwd(), "media");
  const done: { id: number; from: string; to: string; before: number; after: number }[] = [];
  const failed: { id: number; filename: string; error: string }[] = [];

  for (const m of pending.slice(0, batchSize)) {
    const filename = m.filename!;
    try {
      const data = await readFile(path.join(staticDir, filename));
      const updated = await payload.update({
        collection: "media",
        id: m.id,
        data: {},
        file: { data, mimetype: m.mimeType!, name: filename, size: data.length },
        // One cache refresh at the end instead of one per image.
        context: { skipRevalidate: true },
        req,
      });
      done.push({ id: m.id, from: filename, to: updated.filename ?? "", before: data.length, after: updated.filesize ?? 0 });
    } catch (err) {
      failed.push({ id: m.id, filename, error: (err as Error).message });
    }
  }

  return { done, failed, remaining: pending.length - done.length - failed.length };
}

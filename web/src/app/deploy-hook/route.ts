/**
 * Called by deploy/cpanel/deploy.sh right after a deploy. The build prerenders
 * pages from a throwaway database, so this expires every content cache tag;
 * the next visit to each page renders from the live database.
 *
 * Authenticated with a secret the deploy script creates in the hosting
 * account's home folder (~/.dch-deploy-hook-secret). Without that file the
 * route answers 404 — e.g. locally.
 */
import { timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { revalidateTag } from "next/cache";
import { ALL_TAGS } from "@/payload/revalidate";

const notFound = () => new Response("Not found", { status: 404 });

export async function POST(request: Request) {
  const file = process.env.DEPLOY_HOOK_SECRET_FILE || path.join(homedir(), ".dch-deploy-hook-secret");
  let secret: string;
  try {
    secret = (await readFile(file, "utf8")).trim();
  } catch {
    return notFound();
  }
  if (!secret) return notFound();

  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return notFound();

  for (const tag of ALL_TAGS) revalidateTag(tag, { expire: 0 });
  return Response.json({ expired: ALL_TAGS });
}

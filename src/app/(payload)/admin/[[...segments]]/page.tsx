import type { Metadata } from "next";
import { connection } from "next/server";
import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import { importMap } from "../importMap";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default async function Page({ params, searchParams }: Args) {
  // Render every admin page per request. Otherwise Next.js treats it as a
  // prerendered page and the browser reuses the copy it fetched while signed
  // out for 5 minutes, so right after logging in it was sent back to the
  // login form until a refresh.
  await connection();
  return RootPage({ config, params, searchParams, importMap });
}

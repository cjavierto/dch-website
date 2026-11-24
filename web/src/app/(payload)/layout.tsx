/* Root layout for the Payload admin (/admin) and REST API (/api).
   Generated from the Payload template — keep in step with @payloadcms/next. */
import config from "@payload-config";
import "@payloadcms/next/css";
import type { ServerFunctionClient } from "payload";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { connection } from "next/server";
import type React from "react";
import { ADMIN_ICON_FONT_URL } from "@/payload/admin/icons";
import { importMap } from "./admin/importMap.js";
import "./custom.scss";

// Same faces as the public site. Payload renders <html>, so the families are
// handed to custom.scss as CSS variables instead of next/font class names.
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["700"] });
const sans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const fontVars = `:root{--dch-font-sans:${sans.style.fontFamily};--dch-font-serif:${serif.style.fontFamily}}`;

type Args = { children: React.ReactNode };

// The admin reads the session cookie on every request, so it has no static
// shell. Opt this root layout (admin only) out of Cache Components' static-shell
// and instant-navigation validation; the public site's layout keeps it.
export const instant = false;

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function Layout({ children }: Args) {
  // Per request: the admin checks the signed-in user (see admin page.tsx).
  await connection();
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      <style href="dch-admin-fonts" precedence="default">
        {fontVars}
      </style>
      {/* Dashboard icons, subset to the glyphs in payload/admin/icons.ts. */}
      <link rel="stylesheet" href={ADMIN_ICON_FONT_URL} precedence="default" />
      {children}
    </RootLayout>
  );
}

/* Root layout for the Payload admin (/admin) and REST API (/api).
   Generated from the Payload template — keep in step with @payloadcms/next. */
import config from "@payload-config";
import "@payloadcms/next/css";
import type { ServerFunctionClient } from "payload";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type React from "react";
import { importMap } from "./admin/importMap.js";
import "./custom.scss";

type Args = { children: React.ReactNode };

// The admin reads the session cookie on every request, so it has no static
// shell. Opt this root layout (admin only) out of Cache Components' static-shell
// and instant-navigation validation; the public site's layout keeps it.
export const instant = false;

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}

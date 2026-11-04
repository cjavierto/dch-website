import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { ICON_FONT_URL } from "@/components/Icon";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import "../globals.css";

// Root layout for the public site. It lives in a route group so the admin
// (Payload) can bring its own root layout later under app/(payload).

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display-face",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-text-face",
});

export const metadata: Metadata = {
  title: {
    default: "Deiparine Community Hospital · Sibonga, Cebu",
    template: "%s · Deiparine Community Hospital",
  },
  description:
    "DOH-licensed, PhilHealth-accredited community hospital in Poblacion, Sibonga, Cebu. 24-hour emergency room, maternity, surgery and diagnostics.",
  metadataBase: new URL(SITE_URL),
  ...(INDEXABLE ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#0e2559",
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Icon font, subset to the glyphs in components/Icon.tsx. */}
        <link rel="stylesheet" href={ICON_FONT_URL} />
      </head>
      <body className="flex min-h-screen flex-col pb-[calc(var(--mobile-action-bar-h)+env(safe-area-inset-bottom))] nav:pb-0">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

/**
 * Root layout: html, body, fonts and nothing else.
 *
 * The storefront chrome lives in (site)/layout.tsx and the admin chrome in
 * admin/layout.tsx, so the admin panel loads none of the storefront's header,
 * footer, cart or smooth-scrolling.
 */
/**
 * Outfit, loaded as a VARIABLE font.
 *
 * Naming explicit weights pulls four separate static instances; omitting
 * `weight` pulls the variable file instead. That is both smaller over the wire
 * and visibly better: weights interpolate rather than snapping, so the 500 used
 * across headings is the real 500 rather than the nearest cut.
 *
 * `adjustFontFallback` (on by default) matches the fallback metrics so nothing
 * reflows when the webfont lands.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taazo.pk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "taazo. — pressed this morning, bottled by noon",
    template: "%s · taazo.",
  },
  description:
    "Cold-pressed juice, fresh fruit jars and iced tea, pressed each morning in Lahore and delivered the same day. Gifting boxes for Eid, weddings and the office.",
  keywords: [
    "cold pressed juice Lahore",
    "fresh juice delivery Pakistan",
    "fruit gift box Lahore",
    "Eid gifting",
    "corporate gift box Pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "taazo.",
    title: "taazo. — pressed this morning, bottled by noon",
    description:
      "Cold-pressed juice and fresh fruit jars, pressed each morning in Lahore and delivered the same day.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f6efe3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="min-h-full bg-cream text-charcoal">{children}</body>
    </html>
  );
}

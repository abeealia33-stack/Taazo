import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { CHULIMAAR } from "@/lib/chulimaar";
import { HOME_TITLE, HOME_DESCRIPTION, SEARCH_INDEXING } from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(CHULIMAAR.siteUrl),
  title: { default: HOME_TITLE, template: "%s | CHULIMAAR" },
  description: HOME_DESCRIPTION,
  openGraph: { type: "website", locale: "en_PK", siteName: "Chulimaar", title: HOME_TITLE, description: HOME_DESCRIPTION, url: CHULIMAAR.siteUrl },
  twitter: { card: "summary_large_image" },
  robots: { index: SEARCH_INDEXING, follow: SEARCH_INDEXING },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};
export const viewport: Viewport = { themeColor: "#F7F2E7", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${outfit.variable} h-full`}><body className="min-h-full bg-cream text-charcoal">{children}</body></html>;
}

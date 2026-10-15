import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { CHULIMAAR } from "@/lib/chulimaar";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(CHULIMAAR.siteUrl),
  title: { default: "Chulimaar — Rooted in Skardu. Pressed in Skardu.", template: "%s · Chulimaar" },
  description: "Meet Chulimaar, a founder-run apricot kernel oil brand preparing its first batch in Skardu for your kitchen. Sign up for launch updates.",
  openGraph: { type: "website", locale: "en_PK", siteName: "Chulimaar", title: "Chulimaar — A beginning in Skardu", description: "Apricot kernel oil for your kitchen. Preparing our first batch in Skardu." },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#F7F2E7", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${outfit.variable} h-full`}><body className="min-h-full bg-cream text-charcoal">{children}</body></html>;
}

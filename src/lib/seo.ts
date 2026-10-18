import type { Metadata } from "next";
import { CHULIMAAR } from "./chulimaar";

export const CONTENT_DATE = "2026-10-18";
export const HOME_TITLE = "Apricot Kernel Oil from Skardu | Chulimaar";
export const HOME_DESCRIPTION = "Meet Chulimaar, a founder-run apricot kernel oil brand preparing its first batch in Skardu, Pakistan. Explore uses, research and launch updates.";
export function siteUrl(path = "/") { return new URL(path, CHULIMAAR.siteUrl).href; }
export function pageMetadata(title: string, description: string, path: string, article = false): Metadata {
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title: `${title} | Chulimaar`, description, url: siteUrl(path), type: article ? "article" : "website", locale: "en_PK", siteName: "Chulimaar", ...(article ? { publishedTime: CONTENT_DATE, modifiedTime: CONTENT_DATE } : {}) },
    twitter: { card: "summary_large_image", title: `${title} | Chulimaar`, description },
  };
}
export function serializeJsonLd(data: unknown) { return JSON.stringify(data).replace(/</g, "\\u003c"); }
export function pageSchema(path: string, title: string, description: string) {
  const url = siteUrl(path);
  return {
    "@context": "https://schema.org", "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description,
    inLanguage: "en-PK", isPartOf: { "@id": siteUrl("/#website") }, about: { "@id": siteUrl("/#organization") },
    ...(path !== "/" ? { breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Chulimaar", item: siteUrl() },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ] } } : {}),
  };
}

export const GUIDE_LINKS = [
  { href: "/apricot-kernel-oil", title: "Where to buy apricot oil", description: "Meet our first product and follow launch, price and delivery updates.", label: "Our oil" },
  { href: "/guides/apricot-oil-uses", title: "Apricot oil uses", description: "Understand cooking and cosmetic uses, and what to check on a label.", label: "A practical guide" },
  { href: "/guides/apricot-oil-benefits", title: "Apricot oil benefits", description: "What composition research tells us, and where the evidence stops.", label: "The research" },
] as const;

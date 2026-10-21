import type { Metadata } from "next";
import { CHULIMAAR } from "./chulimaar";

export const HOME_TITLE = "CHULIMAAR | Apricot Kernel Oil from Skardu, Pakistan";
export const HOME_DESCRIPTION = "Discover CHULIMAAR apricot kernel oil from Skardu, Pakistan. Explore our story, production process, product details, and everyday uses.";
// Explicitly disable on a separate preview/staging deployment. Never use request-time dates.
export const SEARCH_INDEXING = process.env.CHULIMAAR_SEARCH_INDEXING !== "false";
export const PAGE_DATES: Record<string, { published: string; modified: string }> = {
  "/": { published: "2026-10-18", modified: "2026-10-22" },
  "/apricot-kernel-oil": { published: "2026-10-18", modified: "2026-10-22" },
  "/guides/apricot-oil-skin-hair": { published: "2026-10-18", modified: "2026-10-22" },
  "/guides/apricot-kernel-oil-unsaturated-fats": { published: "2026-10-18", modified: "2026-10-22" },
  "/story": { published: "2026-10-18", modified: "2026-10-22" },
  "/our-process": { published: "2026-10-18", modified: "2026-10-22" },
  "/faq": { published: "2026-10-18", modified: "2026-10-22" },
  "/contact": { published: "2026-10-22", modified: "2026-10-22" },
};
export function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
export function siteUrl(path = "/") { return new URL(path, CHULIMAAR.siteUrl).href; }
export function pageMetadata(title: string, description: string, path: string, article = false): Metadata {
  const dates = PAGE_DATES[path];
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title: `${title} | CHULIMAAR`, description, url: siteUrl(path), type: article ? "article" : "website", locale: "en_PK", siteName: "CHULIMAAR", ...(article && dates ? { publishedTime: dates.published, modifiedTime: dates.modified } : {}) },
    twitter: { card: "summary_large_image", title: `${title} | CHULIMAAR`, description },
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
  { href: "/apricot-kernel-oil", title: "Apricot kernel oil from Skardu", description: "Discover our oil, its culinary focus and the latest product and availability details.", label: "Our oil" },
  { href: "/guides/apricot-oil-skin-hair", title: "Apricot oil for skin and hair", description: "Explore cosmetic conditioning and how to choose a product for your routine.", label: "A practical guide" },
  { href: "/guides/apricot-kernel-oil-unsaturated-fats", title: "Apricot oil and unsaturated fats", description: "Understand fatty acids, balanced diets and the research behind the answers.", label: "The research" },
] as const;

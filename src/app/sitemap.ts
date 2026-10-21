import type { MetadataRoute } from "next";
import { CHULIMAAR } from "@/lib/chulimaar";
import { PAGE_DATES, SEARCH_INDEXING, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SEARCH_INDEXING) return [];
  return [
    ...Object.entries(PAGE_DATES).map(([path, dates]) => ({ url: path === "/" ? CHULIMAAR.siteUrl : siteUrl(path), lastModified: dates.modified, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : .7 })),
    { url: siteUrl("/privacy"), changeFrequency: "monthly", priority: .3 },
  ];
}

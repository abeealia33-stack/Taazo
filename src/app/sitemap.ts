import type { MetadataRoute } from "next";
import { CHULIMAAR } from "@/lib/chulimaar";
import { CONTENT_DATE, GUIDE_LINKS, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: CHULIMAAR.siteUrl, changeFrequency: "weekly", priority: 1 },
    ...[...GUIDE_LINKS.map(link => link.href), "/story", "/our-process", "/faq"].map(path => ({ url: siteUrl(path), lastModified: CONTENT_DATE, changeFrequency: "monthly" as const, priority: .7 })),
    { url: siteUrl("/privacy"), changeFrequency: "monthly", priority: .3 },
  ];
}

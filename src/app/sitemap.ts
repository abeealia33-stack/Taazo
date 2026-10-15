import type { MetadataRoute } from "next";
import { CHULIMAAR } from "@/lib/chulimaar";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: CHULIMAAR.siteUrl, changeFrequency: "weekly", priority: 1 }, { url: `${CHULIMAAR.siteUrl}/privacy`, changeFrequency: "monthly", priority: .3 }];
}

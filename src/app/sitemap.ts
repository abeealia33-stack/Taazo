import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/catalog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taazo.pk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/shop",
    "/gifting",
    "/story",
    "/reels",
    "/faq",
    "/contact",
    "/corporate",
    "/track",
    "/refunds",
    "/terms",
    "/privacy",
  ];
  const slugs = await getAllProductSlugs();

  return [
    ...routes.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...slugs.map((slug) => ({
      url: `${BASE}/shop/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}

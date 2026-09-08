import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taazo.pk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing here is secret, but none of it belongs in search results.
      disallow: ["/admin", "/checkout", "/cart", "/style", "/track"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}

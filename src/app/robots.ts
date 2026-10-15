import type { MetadataRoute } from "next";
import { CHULIMAAR } from "@/lib/chulimaar";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/track", "/launch-preferences", "/shop", "/checkout", "/cart", "/style"] }, sitemap: `${CHULIMAAR.siteUrl}/sitemap.xml` };
}

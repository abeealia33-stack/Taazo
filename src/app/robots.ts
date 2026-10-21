import type { MetadataRoute } from "next";
import { CHULIMAAR } from "@/lib/chulimaar";
import { SEARCH_INDEXING } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!SEARCH_INDEXING) return { rules: { userAgent: "*", disallow: "/" } };
  // Public utility pages must be crawlable for their noindex tags to be seen.
  // Admin authorization is enforced separately; robots is not access control.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/shop", "/style"] }, sitemap: `${CHULIMAAR.siteUrl}/sitemap.xml` };
}

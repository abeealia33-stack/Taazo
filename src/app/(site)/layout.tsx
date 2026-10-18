import { Header } from "@/components/prelaunch/Header";
import { Footer } from "@/components/prelaunch/Footer";
import { getHomepageContent } from "@/lib/homepage-content";
import { MarketingConsent } from "@/components/prelaunch/MarketingConsent";
import { StructuredData } from "@/components/prelaunch/StructuredData";
import { siteUrl } from "@/lib/seo";

// Legacy routes remain in source; never prerender their DB-backed catalogue during pre-launch.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getHomepageContent();
  const organization = {
    "@type": "Organization", "@id": siteUrl("/#organization"), name: "Chulimaar", url: siteUrl(),
    description: "A founder-run apricot kernel oil brand preparing its first batch in Skardu, Pakistan.",
    logo: { "@type": "ImageObject", url: siteUrl("/chulimaar/brand/stacked-color.png") },
    ...(content.contact.email ? { email: content.contact.email } : {}),
    ...(content.contact.instagram ? { sameAs: [content.contact.instagram] } : {}),
  };
  return <div className="cm-site"><StructuredData data={{ "@context": "https://schema.org", "@graph": [organization, { "@type": "WebSite", "@id": siteUrl("/#website"), name: "Chulimaar", url: siteUrl(), inLanguage: "en-PK", publisher: { "@id": organization["@id"] } }] }} /><a className="cm-skip" href="#main">Skip to content</a><Header text={content.text} /><main id="main">{children}</main><Footer content={content} /><MarketingConsent /></div>;
}

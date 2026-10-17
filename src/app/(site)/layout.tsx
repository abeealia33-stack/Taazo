import { Header } from "@/components/prelaunch/Header";
import { Footer } from "@/components/prelaunch/Footer";
import { getHomepageContent } from "@/lib/homepage-content";
import { MarketingConsent } from "@/components/prelaunch/MarketingConsent";

// Legacy routes remain in source; never prerender their DB-backed catalogue during pre-launch.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getHomepageContent();
  return <div className="cm-site"><a className="cm-skip" href="#main">Skip to content</a><Header text={content.text} /><main id="main">{children}</main><Footer content={content} /><MarketingConsent /></div>;
}

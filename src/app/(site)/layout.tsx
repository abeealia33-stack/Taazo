import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { CartDrawer } from "@/components/cart/CartDrawer";

/** The public storefront: brand chrome, cart, smooth scrolling, grain. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-terracotta focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
      <CartDrawer />
    </div>
  );
}

import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SITE, whatsappLink } from "@/lib/site";
import { ComingSoonTag } from "@/components/ui/ComingSoon";

const COLUMNS = [
  {
    heading: "shop",
    links: [
      { href: "/shop", label: "all products" },
      { href: "/shop?category=juice", label: "cold-pressed juice" },
      { href: "/shop?category=jars", label: "fruit jars" },
      { href: "/shop?category=tea", label: "iced tea" },
      { href: "/gifting", label: "gifting boxes" },
    ],
  },
  {
    heading: "taazo.",
    links: [
      { href: "/story", label: "our story" },
      { href: "/reels", label: "from the kitchen" },
      { href: "/faq", label: "freshness & delivery" },
      { href: "/corporate", label: "corporate & bulk" },
      { href: "/track", label: "track your order" },
      { href: "/contact", label: "contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-sand-300/70 bg-sand-100">
      <div className="container-taazo py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Wordmark className="h-8 w-auto text-terracotta" />
            <p className="mt-5 max-w-xs text-sm text-sand-700">
              Cold-pressed each morning in {SITE.city}, delivered the same day.
              No concentrate, no shortcuts.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-2xs uppercase tracking-[0.18em] text-sand-500">
                {col.heading}
              </h2>
              <ul className="mt-5 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-charcoal/80 transition-colors hover:text-terracotta"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-2xs uppercase tracking-[0.18em] text-sand-500">
              order &amp; ask
            </h2>
            <ul className="mt-5 flex flex-col gap-2.5 text-sm">
              <li>
                <a
                  href={whatsappLink("Hi taazo! I'd like to place an order.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-charcoal/80 transition-colors hover:text-terracotta"
                >
                  WhatsApp us
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phoneDisplay.replace(/\s/g, "")}`}
                  className="text-charcoal/80 transition-colors hover:text-terracotta"
                >
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                {SITE.email ? (
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-charcoal/80 transition-colors hover:text-terracotta"
                  >
                    {SITE.email}
                  </a>
                ) : (
                  <ComingSoonTag label="Email" />
                )}
              </li>
              <li>
                {SITE.instagram ? (
                  <a
                    href={SITE.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-charcoal/80 transition-colors hover:text-terracotta"
                  >
                    Instagram
                  </a>
                ) : (
                  <ComingSoonTag label="Instagram" />
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-sand-300/70 pt-7 text-xs text-sand-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} taazo. Made fresh in {SITE.city}.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/refunds" className="transition-colors hover:text-terracotta">
              Refunds
            </Link>
            <Link href="/terms" className="transition-colors hover:text-terracotta">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-terracotta">
              Privacy
            </Link>
            <span className="text-sand-500">
              Cash on delivery · Bank transfer
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { CartButton } from "@/components/cart/CartButton";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/gifting", label: "Gifting" },
  { href: "/story", label: "Story" },
  // An acronym, so it takes full caps rather than just an initial capital.
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  /**
   * The homepage hero is a dark, full-bleed photograph and the header sits on
   * top of it. Until the user scrolls past it, the header inverts to cream —
   * otherwise the terracotta wordmark disappears into the image.
   */
  const overHero = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-[var(--dur-base)]",
        scrolled || open
          ? "bg-cream/85 shadow-xs backdrop-blur-md"
          : "bg-transparent",
        overHero && !scrolled && !open && "text-cream",
      )}
    >
      <div className="container-taazo flex h-(--header-h) items-center justify-between">
        <Link
          href="/"
          aria-label="taazo. home"
          className={cn(
            "transition-opacity hover:opacity-80",
            overHero && !scrolled && !open ? "text-cream" : "text-terracotta",
          )}
        >
          <Wordmark className="h-6 w-auto md:h-7" />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-9 md:flex"
        >
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative text-[0.95rem] tracking-tight transition-colors",
                  "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-terracotta",
                  "after:transition-[width] after:duration-[var(--dur-base)] after:ease-(--ease-out-soft)",
                  overHero && !scrolled && !open
                    ? "text-cream/85 after:bg-cream hover:text-cream after:w-0 hover:after:w-full"
                    : active
                      ? "text-terracotta after:w-full"
                      : "text-charcoal/80 hover:text-terracotta after:w-0 hover:after:w-full",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <CartButton />
          <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-sand-200/70 md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={cn(
                "absolute left-0 h-px w-full bg-current transition-transform duration-[var(--dur-base)] ease-(--ease-out-soft)",
                open ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-px w-full bg-current transition-transform duration-[var(--dur-base)] ease-(--ease-out-soft)",
                open ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-sand-300/60 bg-cream md:hidden"
      >
        <nav aria-label="Mobile" className="container-taazo py-6">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md py-3 text-2xl tracking-tight text-charcoal transition-colors hover:text-terracotta"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

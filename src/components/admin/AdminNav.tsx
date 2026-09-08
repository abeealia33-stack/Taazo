"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { logout } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";
import type { AdminSession } from "@/lib/auth";

const LINKS = [
  { href: "/admin", label: "Today", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/delivery", label: "Delivery" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories", ownerOnly: true },
  { href: "/admin/content", label: "Content", ownerOnly: true },
  { href: "/admin/reels", label: "Reels" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports", ownerOnly: true },
  { href: "/admin/settings", label: "Settings", ownerOnly: true },
  { href: "/admin/account", label: "Account" },
];

export function AdminNav({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const links = LINKS.filter(
    (l) => !l.ownerOnly || session.role === "owner",
  );

  return (
    <header className="sticky top-0 z-40 border-b border-sand-300 bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/admin" className="flex items-center gap-3 text-terracotta">
          <Wordmark className="h-5 w-auto" decorative />
          <span className="text-2xs uppercase tracking-[0.16em] text-sand-500">
            admin
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-sand-600 sm:inline">
            {session.name}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full px-3 py-1.5 text-xs text-sand-600 transition-colors hover:bg-sand-200 hover:text-charcoal"
            >
              sign out
            </button>
          </form>
        </div>
      </div>

      {/* Horizontally scrollable on a phone — never a hamburger for a tool
          you use fifty times a week. */}
      <nav
        aria-label="Admin sections"
        className="mx-auto max-w-6xl overflow-x-auto px-4 md:px-6"
      >
        <ul className="flex min-w-max gap-1 pb-2">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-4 py-2 text-sm transition-colors",
                    active
                      ? "bg-charcoal text-cream"
                      : "text-sand-700 hover:bg-sand-200",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

"use client";

import { useCart, cartCount } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";

export function CartButton() {
  const { lines, setOpen } = useCart();
  // The cart is restored from localStorage, so the count must not be rendered
  // on the server — it would mismatch on hydration.
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(lines) : 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={count > 0 ? `Basket, ${count} items` : "Basket, empty"}
      className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-sand-200/70"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 text-2xs font-medium tabular-nums text-cream">
          {count}
        </span>
      )}
    </button>
  );
}

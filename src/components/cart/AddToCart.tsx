"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import type { CatalogProduct } from "@/lib/catalog";

export function AddToCart({
  product,
  available,
}: {
  product: CatalogProduct;
  /** Bottles left in the live batch. undefined = unknown, 0 = sold out. */
  available?: number;
}) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const soldOut = available === 0;
  const max = available !== undefined && available > 0 ? Math.min(20, available) : 20;

  if (soldOut) {
    return (
      <div className="rounded-xl bg-sand-200/70 px-5 py-4">
        <p className="text-base text-charcoal">Sold out for today</p>
        <p className="mt-1 text-sm text-sand-600">
          We press again tomorrow morning. Nothing is held over from today.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-14 items-center rounded-full bg-sand-200/80">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Reduce quantity"
          className="grid h-14 w-12 place-items-center rounded-full text-lg transition-colors hover:bg-sand-300"
        >
          −
        </button>
        <span
          className="w-8 text-center text-base tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          aria-label="Increase quantity"
          className="grid h-14 w-12 place-items-center rounded-full text-lg transition-colors hover:bg-sand-300"
        >
          +
        </button>
      </div>

      <Button
        size="lg"
        className="flex-1 sm:flex-none"
        onClick={() =>
          add(
            {
              id: product.slug,
              slug: product.slug,
              name: product.name,
              price: product.price,
              size: product.size,
              accent: product.accent,
              photo: product.photo,
            },
            qty,
          )
        }
      >
        add to basket
      </Button>
    </div>
  );
}

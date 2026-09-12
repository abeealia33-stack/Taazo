"use client";

import { useEffect, useState } from "react";
import { AddToCart } from "./AddToCart";
import { cn, formatPKR } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";
import { buyBoxSelector } from "./buyBox";

/**
 * The buy action, brought back once the real one scrolls away.
 *
 * On a page where the specs and ingredients sit below the fold, anyone who
 * reads first and decides second would otherwise have to scroll back up to
 * buy. Watches the in-page buy box rather than a scroll offset, so it appears
 * exactly when the button it mirrors is gone.
 */
export function StickyBuyBar({
  product,
  available,
}: {
  product: CatalogProduct;
  available?: number;
}) {
  const [shown, setShown] = useState(false);
  const soldOut = available === 0;

  useEffect(() => {
    if (soldOut) return;

    const buyBox = document.querySelector(buyBoxSelector);
    if (!buyBox) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only once it has left upward — scrolling *above* the buy box, where
        // the real button is still coming, should not trigger the bar.
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: "0px 0px -40% 0px" },
    );

    observer.observe(buyBox);
    return () => observer.disconnect();
  }, [soldOut]);

  if (soldOut) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-sand-300/70 bg-cream/95 backdrop-blur",
        "pb-[env(safe-area-inset-bottom)] transition-[opacity,transform] duration-[var(--dur-base)] ease-(--ease-out-soft)",
        "motion-reduce:transition-opacity",
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0 motion-reduce:translate-y-0",
      )}
      aria-hidden={!shown}
    >
      <div className="container-taazo flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-charcoal">{product.name}</p>
          <p className="text-sm tabular-nums text-sand-700">
            {formatPKR(product.price)}
            <span className="text-sand-500"> · {product.size}</span>
          </p>
        </div>

        <div className="shrink-0">
          <AddToCart product={product} available={available} />
        </div>
      </div>
    </div>
  );
}

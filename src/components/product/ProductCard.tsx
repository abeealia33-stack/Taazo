"use client";

import Link from "next/link";
import { useRef } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { ProductImage } from "./ProductImage";
import { formatPKR, cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  product: CatalogProduct;
  /** Bottles left in the live batch. undefined = unknown, 0 = sold out. */
  available?: number;
  /** Editorial grid: some cards sit taller than others. */
  tall?: boolean;
  priority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  available,
  tall = false,
  priority,
  className,
}: Props) {
  const soldOut = available === 0;
  const lowStock = available !== undefined && available > 0 && available <= 5;
  const ref = useRef<HTMLAnchorElement>(null);

  /**
   * Hover tilt. Pointer-driven rather than CSS-only so the card leans toward
   * the cursor rather than tipping the same way every time. Transform only —
   * no layout properties are touched.
   */
  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) translate3d(0,-6px,0)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <Link
      ref={ref}
      href={`/shop/${product.slug}`}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      style={{ ["--accent" as string]: product.accent }}
      className={cn(
        "group relative block rounded-xl transition-[transform,box-shadow] duration-[var(--dur-base)] ease-(--ease-out-soft) will-change-transform hover:shadow-lg",
        soldOut && "opacity-70",
        className,
      )}
    >
      {/* accent bleed, behind the card */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-[var(--dur-slow)] group-hover:opacity-45"
        style={{ background: "var(--accent)" }}
      />

      <ProductImage
        photo={product.photo}
        name={product.name}
        accent={product.accent}
        hoverPhoto={product.photos[1] ?? null}
        ratio={tall ? "product" : "square"}
        priority={priority}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
      />

      {soldOut && (
        <span className="absolute left-3 top-3 rounded-full bg-charcoal/90 px-3 py-1.5 text-2xs uppercase tracking-[0.12em] text-cream">
          sold out today
        </span>
      )}
      {lowStock && (
        <span className="absolute left-3 top-3 rounded-full bg-terracotta px-3 py-1.5 text-2xs uppercase tracking-[0.12em] text-cream">
          only {available} left
        </span>
      )}

      <div className="flex items-start justify-between gap-4 px-1 pt-4">
        <div>
          <h3 className="text-lg tracking-tight text-charcoal transition-colors group-hover:text-terracotta">
            {product.name}
          </h3>
          <p className="mt-0.5 text-sm text-sand-600">{product.tagline}</p>
        </div>
        <div className="text-right">
          <p className="whitespace-nowrap text-base tabular-nums text-charcoal">
            {formatPKR(product.price)}
          </p>
          <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
            {product.size}
          </p>
        </div>
      </div>
    </Link>
  );
}

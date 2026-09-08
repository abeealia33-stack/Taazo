"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart, cartSubtotal } from "@/store/cart";
import { ProductImage } from "@/components/product/ProductImage";
import { ButtonLink } from "@/components/ui/Button";
import { formatPKR, cn } from "@/lib/utils";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { useHydrated } from "@/hooks/useHydrated";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();

  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!hydrated) return null;

  const subtotal = cartSubtotal(lines);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-charcoal/35 backdrop-blur-[2px] transition-opacity duration-[var(--dur-base)]",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your basket"
        tabIndex={-1}
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-xl outline-none",
          "transition-transform duration-[var(--dur-slow)] ease-(--ease-out-soft)",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-sand-300/70 px-6 py-5">
          <h2 className="text-xl tracking-tight">Your basket</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close basket"
            className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-sand-200"
          >
            <span aria-hidden className="text-xl leading-none">×</span>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-lg text-charcoal">Nothing in here yet.</p>
            <p className="max-w-xs text-sm text-sand-600">
              Today&rsquo;s batch is pressed and waiting. It will not be here
              tomorrow.
            </p>
            <ButtonLink href="/shop" onClick={() => setOpen(false)} className="mt-2">
              see today&rsquo;s batch
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sand-300/60 overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  <ProductImage
                    photo={line.photo}
                    name={line.name}
                    accent={line.accent}
                    ratio="square"
                    sizes="80px"
                    className="w-20 shrink-0 rounded-md"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base text-charcoal">
                          {line.name}
                        </p>
                        <p className="text-xs text-sand-600">{line.size}</p>
                        {line.giftBox?.noteCard && (
                          <p className="mt-1 line-clamp-2 text-xs italic text-sand-600">
                            &ldquo;{line.giftBox.noteCard}&rdquo;
                          </p>
                        )}
                      </div>
                      <p className="whitespace-nowrap text-sm tabular-nums">
                        {formatPKR(line.price * line.qty)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-full bg-sand-200/80">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label={`Reduce quantity of ${line.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-sand-300"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-sand-300"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.id)}
                        className="text-xs text-sand-600 underline-offset-4 transition-colors hover:text-terracotta hover:underline"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-sand-300/70 px-6 py-5">
              <div className="flex items-center justify-between text-base">
                <span className="text-sand-700">Subtotal</span>
                <span className="tabular-nums text-charcoal">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-sand-600">
                Delivery calculated at checkout, by area.
              </p>
              <ButtonLink
                href="/checkout"
                className="mt-4 w-full"
                size="lg"
                onClick={() => setOpen(false)}
              >
                checkout
              </ButtonLink>
              <div className="mt-3 flex items-center justify-center gap-4 text-sm text-sand-600">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="underline-offset-4 hover:text-terracotta hover:underline"
                >
                  view full basket
                </Link>
                <span aria-hidden>·</span>
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="underline-offset-4 hover:text-terracotta hover:underline"
                >
                  keep shopping
                </Link>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

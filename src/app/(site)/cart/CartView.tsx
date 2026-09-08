"use client";

import Link from "next/link";
import { useCart, cartSubtotal } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { ProductImage } from "@/components/product/ProductImage";
import { ButtonLink } from "@/components/ui/Button";
import { formatPKR } from "@/lib/utils";

/**
 * The cart as a page, not just a drawer.
 *
 * The drawer is fine for a quick glance, but people share cart links, refresh,
 * come back on another device, and on a phone a full page is simply easier to
 * work in than a panel. Both read the same store, so they never disagree.
 */
export function CartView({
  deliveryFrom,
  freeOver,
}: {
  deliveryFrom: number;
  freeOver: number;
}) {
  const hydrated = useHydrated();
  const { lines, setQty, remove, clear } = useCart();

  if (!hydrated) {
    return (
      <p className="py-24 text-center text-sand-600">Loading your basket…</p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <p className="text-2xl tracking-tight text-charcoal">
          Your basket is empty
        </p>
        <p className="max-w-sm text-sand-600">
          Today&rsquo;s batch is pressed and waiting. Nothing carries over to
          tomorrow.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" size="lg">
            see today&rsquo;s batch
          </ButtonLink>
          <ButtonLink href="/gifting" size="lg" variant="secondary">
            build a gift box
          </ButtonLink>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(lines);
  const qualifiesFree = freeOver > 0 && subtotal >= freeOver;
  const toFree = Math.max(0, freeOver - subtotal);

  return (
    <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
      <div>
        <ul className="divide-y divide-sand-300/60 border-y border-sand-300/60">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-5 py-6">
              <ProductImage
                photo={line.photo}
                name={line.name}
                accent={line.accent}
                ratio="square"
                sizes="112px"
                className="w-24 shrink-0 rounded-lg sm:w-28"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {line.giftBox ? (
                      <p className="text-lg text-charcoal">{line.name}</p>
                    ) : (
                      <Link
                        href={`/shop/${line.slug}`}
                        className="text-lg text-charcoal underline-offset-4 hover:text-terracotta hover:underline"
                      >
                        {line.name}
                      </Link>
                    )}
                    <p className="mt-0.5 text-sm text-sand-600">{line.size}</p>

                    {line.giftBox && (
                      <div className="mt-2 rounded-lg bg-sand-100 px-3 py-2 text-xs text-sand-700">
                        <p>
                          {line.giftBox.items
                            .map((i) => `${i.qty}× ${i.name}`)
                            .join(", ")}
                        </p>
                        {line.giftBox.recipientName && (
                          <p className="mt-1">
                            For{" "}
                            <span className="text-charcoal">
                              {line.giftBox.recipientName}
                            </span>
                          </p>
                        )}
                        {line.giftBox.noteCard && (
                          <p className="mt-1 italic">
                            &ldquo;{line.giftBox.noteCard}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="whitespace-nowrap text-base tabular-nums text-charcoal">
                    {formatPKR(line.price * line.qty)}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-4 pt-4">
                  <div className="flex items-center rounded-full bg-sand-200/80">
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty - 1)}
                      aria-label={`Reduce quantity of ${line.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-sand-300"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty + 1)}
                      aria-label={`Increase quantity of ${line.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-sand-300"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm text-sand-500">
                    {formatPKR(line.price)} each
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(line.id)}
                    className="ml-auto text-sm text-sand-600 underline-offset-4 transition-colors hover:text-terracotta hover:underline"
                  >
                    remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/shop"
            className="text-sm text-sand-600 underline-offset-4 hover:text-terracotta hover:underline"
          >
            ← keep shopping
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-sm text-sand-600 underline-offset-4 transition-colors hover:text-terracotta hover:underline"
          >
            empty basket
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl bg-sand-100 p-7 ring-1 ring-sand-200">
          <h2 className="text-lg tracking-tight text-charcoal">Summary</h2>

          <dl className="mt-5 flex flex-col gap-2.5 border-t border-sand-300/70 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-sand-700">Subtotal</dt>
              <dd className="tabular-nums text-charcoal">
                {formatPKR(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sand-700">Delivery</dt>
              <dd className="text-right text-sand-600">
                {qualifiesFree ? (
                  <span className="text-olive">Free</span>
                ) : (
                  <>from {formatPKR(deliveryFrom)}</>
                )}
              </dd>
            </div>
          </dl>

          {freeOver > 0 && !qualifiesFree && (
            <p className="mt-4 rounded-lg bg-gold/12 px-4 py-3 text-xs text-sand-800">
              Add {formatPKR(toFree)} more for free delivery.
            </p>
          )}

          <p className="mt-4 text-xs text-sand-600">
            The exact delivery fee depends on your area and is shown at
            checkout, before you pay.
          </p>

          <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
            checkout
          </ButtonLink>

          <p className="mt-4 text-center text-xs text-sand-600">
            Cash on delivery or bank transfer. No account needed.
          </p>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import { formatPKR, cn } from "@/lib/utils";

type GiftTier = {
  id: string;
  slug: string;
  name: string;
  bottles: number;
  price: number;
  blurb: string;
};

type Picks = Record<string, number>;

/**
 * Build-your-box.
 *
 * The brand's differentiator turned into an actual product. Three steps, all
 * visible at once on desktop so the box is never a mystery: choose a size,
 * fill it, write the card.
 */
export function GiftBoxBuilder({
  products,
  tiers,
}: {
  products: CatalogProduct[];
  tiers: GiftTier[];
}) {
  const add = useCart((s) => s.add);
  const [tierSlug, setTierSlug] = useState<string>(
    tiers[1]?.slug ?? tiers[0]?.slug ?? "",
  );
  const [picks, setPicks] = useState<Picks>({});
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState("");
  const [added, setAdded] = useState(false);

  const tier = tiers.find((t) => t.slug === tierSlug);

  // Hooks must run unconditionally, so the empty-tiers guard comes after
  // every hook call rather than short-circuiting the component early.
  const chosen = useMemo(
    () => Object.values(picks).reduce((a, b) => a + b, 0),
    [picks],
  );

  if (!tier) {
    return (
      <p className="rounded-xl bg-sand-100 p-6 text-center text-sand-600">
        No gift box sizes are set up yet. Add one in admin under Content.
      </p>
    );
  }

  const remaining = tier.bottles - chosen;
  const full = remaining === 0;

  const setPick = (slug: string, next: number) => {
    setAdded(false);
    setPicks((prev) => {
      const value = Math.max(0, next);
      const others = Object.entries(prev)
        .filter(([k]) => k !== slug)
        .reduce((a, [, v]) => a + v, 0);
      if (others + value > tier.bottles) return prev;
      const copy = { ...prev, [slug]: value };
      if (value === 0) delete copy[slug];
      return copy;
    });
  };

  const changeTier = (slug: string) => {
    setTierSlug(slug);
    setPicks({});
    setAdded(false);
  };

  const addBox = () => {
    const items = Object.entries(picks).map(([slug, qty]) => {
      const p = products.find((x) => x.slug === slug)!;
      return { slug, name: p.name, qty };
    });

    add({
      // A configured box is unique per configuration, so the id encodes it.
      id: `giftbox-${tier.slug}-${items
        .map((i) => `${i.slug}x${i.qty}`)
        .join("_")}-${note ? "note" : "plain"}`,
      slug: tier.slug,
      name: `${tier.name} — gift box`,
      price: tier.price,
      size: `${tier.bottles} bottles`,
      accent: "var(--color-gold)",
      photo: null,
      giftBox: {
        bottles: tier.bottles,
        items,
        noteCard: note || undefined,
        recipientName: recipient || undefined,
      },
    });
    setAdded(true);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
      <div className="flex flex-col gap-10">
        {/* Step 1 */}
        <fieldset>
          <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            step one · choose a size
          </legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {tiers.map((t) => {
              const active = t.slug === tierSlug;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => changeTier(t.slug)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border p-5 text-left transition-[background-color,border-color,transform] duration-[var(--dur-fast)]",
                    active
                      ? "border-terracotta bg-terracotta/8"
                      : "border-sand-300 bg-cream hover:border-sand-400",
                  )}
                >
                  <p className="text-lg tracking-tight text-charcoal">
                    {t.bottles} bottles
                  </p>
                  <p className="mt-1 text-sm tabular-nums text-sand-600">
                    {formatPKR(t.price)}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Step 2 */}
        <fieldset>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
              step two · fill the box
            </legend>
            <p
              className="text-sm tabular-nums text-charcoal"
              aria-live="polite"
              aria-atomic="true"
            >
              {full ? (
                <span className="text-olive">Box is full</span>
              ) : (
                <>
                  {remaining} {remaining === 1 ? "bottle" : "bottles"} left to
                  choose
                </>
              )}
            </p>
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {products.map((p) => {
              const qty = picks[p.slug] ?? 0;
              return (
                <li
                  key={p.slug}
                  className="flex items-center justify-between gap-4 rounded-lg border border-sand-300/70 bg-cream px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className="h-8 w-2 shrink-0 rounded-full"
                      style={{ background: p.accent }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base text-charcoal">{p.name}</p>
                      <p className="text-xs text-sand-600">{p.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center rounded-full bg-sand-200/80">
                    <button
                      type="button"
                      onClick={() => setPick(p.slug, qty - 1)}
                      disabled={qty === 0}
                      aria-label={`Remove one ${p.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-sand-300 disabled:opacity-35"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPick(p.slug, qty + 1)}
                      disabled={full}
                      aria-label={`Add one ${p.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-sand-300 disabled:opacity-35"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {/* Step 3 */}
        <fieldset>
          <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            step three · write the card
          </legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-sand-700">Who is it for?</span>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ammi, Bilal, the Khan family"
                className="rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-sand-400 focus:border-terracotta focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm text-sand-700">
                Your note{" "}
                <span className="text-sand-500">
                  — handwritten onto a card, {160 - note.length} characters left
                </span>
              </span>
              <textarea
                value={note}
                maxLength={160}
                rows={3}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Eid Mubarak. Drink this before anyone else finds it."
                className="resize-none rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-sand-400 focus:border-terracotta focus:outline-none"
              />
            </label>
          </div>
        </fieldset>
      </div>

      {/* Live summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl bg-olive p-7 text-cream shadow-lg">
          <p className="text-2xs uppercase tracking-[0.2em] text-cream/55">
            your box
          </p>
          <p className="display-tight mt-3 text-3xl">{tier.name}</p>

          <ul className="mt-6 flex flex-col gap-2 border-t border-cream/15 pt-5 text-sm">
            {chosen === 0 ? (
              <li className="text-cream/55">
                Nothing chosen yet — pick {tier.bottles} bottles.
              </li>
            ) : (
              Object.entries(picks).map(([slug, qty]) => {
                const p = products.find((x) => x.slug === slug);
                return (
                  <li key={slug} className="flex justify-between gap-4">
                    <span className="text-cream/80">{p?.name ?? slug}</span>
                    <span className="tabular-nums text-cream">×{qty}</span>
                  </li>
                );
              })
            )}
          </ul>

          {recipient && (
            <p className="mt-5 border-t border-cream/15 pt-5 text-sm text-cream/70">
              For <span className="text-cream">{recipient}</span>
            </p>
          )}
          {note && (
            <p className="mt-3 text-sm italic leading-relaxed text-cream/70">
              &ldquo;{note}&rdquo;
            </p>
          )}

          <div className="mt-7 flex items-baseline justify-between border-t border-cream/15 pt-5">
            <span className="text-cream/70">Total</span>
            <span className="text-2xl tabular-nums text-gold">
              {formatPKR(tier.price)}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="mt-5 w-full"
            disabled={!full}
            onClick={addBox}
          >
            {full ? "add box to basket" : `choose ${remaining} more`}
          </Button>

          <p
            className="mt-3 min-h-5 text-center text-sm text-gold"
            aria-live="polite"
          >
            {added ? "Added — the card will be handwritten." : ""}
          </p>

          <p className="mt-4 text-xs leading-relaxed text-cream/50">
            Packed on ice the morning it goes out. Delivered cold across
            Lahore, same day where we can.
          </p>
        </div>
      </aside>
    </div>
  );
}

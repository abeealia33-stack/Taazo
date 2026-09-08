"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { placeOrder, type CheckoutState } from "./actions";
import { useCart, cartSubtotal } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { Button, ButtonLink } from "@/components/ui/Button";
import { formatPKR, cn } from "@/lib/utils";

type Zone = {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  minOrder: number;
};

type Props = {
  zones: Zone[];
  freeOver: number;
  bank: {
    bank: string;
    accountTitle: string;
    accountNumber: string;
    jazzCash: string;
  };
  sameDay: boolean;
  /**
   * Generated once per page request on the server. A double-tapped submit
   * reuses it, so the action returns the existing order rather than creating a
   * second one. Generating it here (rather than during client render) keeps the
   * render pure.
   */
  idempotencyKey: string;
};

const SLOTS = [
  { value: "morning", label: "Morning", detail: "9am – 12pm" },
  { value: "afternoon", label: "Afternoon", detail: "12pm – 4pm" },
  { value: "evening", label: "Evening", detail: "4pm – 8pm" },
];

const initialState: CheckoutState = { ok: false };

export function CheckoutForm({
  zones,
  freeOver,
  bank,
  sameDay,
  idempotencyKey,
}: Props) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { lines, clear } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [method, setMethod] = useState<"cod" | "transfer">("cod");

  const subtotal = hydrated ? cartSubtotal(lines) : 0;
  const zone = useMemo(
    () => zones.find((z) => z.id === zoneId) ?? zones[0],
    [zones, zoneId],
  );
  const deliveryFee =
    !zone || (freeOver > 0 && subtotal >= freeOver) ? 0 : zone.fee;
  const total = subtotal + deliveryFee;
  const belowMinimum = zone ? subtotal < zone.minOrder : false;

  useEffect(() => {
    if (state.ok && state.orderNumber) {
      clear();
      router.push(`/checkout/thank-you?o=${state.orderNumber}`);
    }
  }, [state, clear, router]);

  if (!hydrated) {
    return <div className="py-24 text-center text-sand-600">Loading your basket…</div>;
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
        <ButtonLink href="/shop" size="lg">
          see today&rsquo;s batch
        </ButtonLink>
      </div>
    );
  }

  const payload = lines.map((l) => ({
    slug: l.giftBox ? l.slug : l.slug,
    name: l.name,
    price: l.price,
    qty: l.qty,
    size: l.size,
    isGiftBox: Boolean(l.giftBox),
    giftItems: l.giftBox?.items.map((i) => `${i.slug} x ${i.qty}`) ?? [],
    noteCard: l.giftBox?.noteCard,
    recipientName: l.giftBox?.recipientName,
  }));

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
      <input type="hidden" name="lines" value={JSON.stringify(payload)} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="zoneId" value={zoneId} />

      <div className="flex flex-col gap-10">
        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-terracotta/40 bg-terracotta/8 px-5 py-4 text-sm text-terracotta-deep"
          >
            {state.error}
          </p>
        )}

        <fieldset>
          <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            who is it for
          </legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Your name" name="customerName" error={err("customerName")} required />
            <Field
              label="Mobile number"
              name="phone"
              type="tel"
              placeholder="0300 1234567"
              hint="We message the confirmation here"
              error={err("phone")}
              required
            />
            <Field
              label="Email (optional)"
              name="email"
              type="email"
              placeholder="you@example.com"
              hint="For a written copy of your order"
              error={err("email")}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            where it goes
          </legend>
          <div className="mt-5 grid gap-4">
            <Field
              label="Full address"
              name="addressLine"
              placeholder="House 12, Street 4, Block B"
              error={err("addressLine")}
              required
            />

            <label className="flex flex-col gap-2">
              <span className="text-sm text-sand-700">
                Area <span className="text-terracotta">*</span>
              </span>
              <select
                name="area"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal focus:border-terracotta focus:outline-none"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} — {formatPKR(z.fee)}
                    {z.minOrder > 0 ? ` (min ${formatPKR(z.minOrder)})` : ""}
                  </option>
                ))}
              </select>
              <span className="text-xs text-sand-600">
                {zone?.areas.join(" · ")}
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            when {sameDay ? "today" : "tomorrow"}
          </legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {SLOTS.map((slot, i) => (
              <label
                key={slot.value}
                className="cursor-pointer rounded-xl border border-sand-300 bg-cream p-4 transition-colors has-checked:border-terracotta has-checked:bg-terracotta/8"
              >
                <input
                  type="radio"
                  name="deliverySlot"
                  value={slot.value}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                <span className="block text-base text-charcoal">{slot.label}</span>
                <span className="mt-0.5 block text-xs text-sand-600">
                  {slot.detail}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            how you pay
          </legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl border border-sand-300 bg-cream p-5 transition-colors has-checked:border-terracotta has-checked:bg-terracotta/8">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
                className="sr-only"
              />
              <span className="block text-base text-charcoal">
                Cash on delivery
              </span>
              <span className="mt-1 block text-xs text-sand-600">
                Pay the rider when it arrives.
              </span>
            </label>

            <label className="cursor-pointer rounded-xl border border-sand-300 bg-cream p-5 transition-colors has-checked:border-terracotta has-checked:bg-terracotta/8">
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={method === "transfer"}
                onChange={() => setMethod("transfer")}
                className="sr-only"
              />
              <span className="block text-base text-charcoal">
                Bank / JazzCash transfer
              </span>
              <span className="mt-1 block text-xs text-sand-600">
                Send now, upload the screenshot.
              </span>
            </label>
          </div>

          {method === "transfer" && (
            <div className="mt-4 rounded-xl bg-sand-100 p-5 ring-1 ring-sand-200">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Detail label="Bank" value={bank.bank} />
                <Detail label="Account title" value={bank.accountTitle} />
                <Detail label="Account number" value={bank.accountNumber} />
                <Detail label="JazzCash" value={bank.jazzCash} />
              </dl>
              <label className="mt-5 flex flex-col gap-2">
                <span className="text-sm text-sand-700">
                  Upload your payment screenshot
                </span>
                <input
                  type="file"
                  name="paymentProof"
                  accept="image/png,image/jpeg,image/webp"
                  className="text-sm text-sand-700 file:mr-4 file:rounded-full file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-cream"
                />
                <span className="text-xs text-sand-600">
                  You can also send it on WhatsApp afterwards.
                </span>
              </label>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            anything else
          </legend>
          <label className="mt-5 flex flex-col gap-2">
            <span className="text-sm text-sand-700">
              Delivery notes <span className="text-sand-500">(optional)</span>
            </span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Gate code, landmark, best time to call"
              className="resize-none rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-sand-400 focus:border-terracotta focus:outline-none"
            />
          </label>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl bg-sand-100 p-7 ring-1 ring-sand-200">
          <h2 className="text-lg tracking-tight text-charcoal">Your order</h2>

          <ul className="mt-5 flex flex-col gap-3 border-t border-sand-300/70 pt-5 text-sm">
            {lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-4">
                <span className="min-w-0 text-sand-700">
                  <span className="tabular-nums">{l.qty}×</span> {l.name}
                </span>
                <span className="whitespace-nowrap tabular-nums text-charcoal">
                  {formatPKR(l.price * l.qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 flex flex-col gap-2 border-t border-sand-300/70 pt-5 text-sm">
            <Row label="Subtotal" value={formatPKR(subtotal)} />
            <Row
              label="Delivery"
              value={deliveryFee === 0 ? "Free" : formatPKR(deliveryFee)}
            />
          </dl>

          <div className="mt-5 flex items-baseline justify-between border-t border-sand-300/70 pt-5">
            <span className="text-base text-sand-700">Total</span>
            <span className="text-2xl tabular-nums text-charcoal">
              {formatPKR(total)}
            </span>
          </div>

          {belowMinimum && zone && (
            <p className="mt-4 text-sm text-terracotta-deep">
              Orders to {zone.name} start at {formatPKR(zone.minOrder)}.
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={pending || belowMinimum}
          >
            {pending ? "placing your order…" : `place order · ${formatPKR(total)}`}
          </Button>

          <p className="mt-4 text-xs leading-relaxed text-sand-600">
            No account needed. We confirm every order on WhatsApp before it goes
            out.{" "}
            <Link href="/faq" className="underline underline-offset-2">
              Delivery &amp; freshness
            </Link>
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  hint,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-sand-700">
        {label} {required && <span className="text-terracotta">*</span>}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "rounded-lg border bg-cream px-4 py-3 text-base text-charcoal placeholder:text-sand-400 focus:outline-none",
          error
            ? "border-terracotta focus:border-terracotta"
            : "border-sand-300 focus:border-terracotta",
        )}
      />
      {error ? (
        <span id={`${name}-error`} role="alert" className="text-xs text-terracotta-deep">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-sand-600">{hint}</span>
      ) : null}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sand-700">{label}</dt>
      <dd className="tabular-nums text-charcoal">{value}</dd>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-sand-600">{label}</dt>
      <dd className="text-sm text-charcoal">{value}</dd>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { createManualOrder, type ManualOrderState } from "./actions";
import { Card } from "@/components/admin/ui";
import { formatPKR } from "@/lib/utils";

type Product = {
  slug: string;
  name: string;
  price: number;
  size: string;
  accent: string;
  available: number;
};

type Zone = { id: string; name: string; fee: number; minOrder: number };

const field =
  "rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm focus:border-terracotta focus:outline-none";

const initial: ManualOrderState = {};

export function ManualOrderForm({
  products,
  zones,
}: {
  products: Product[];
  zones: Zone[];
}) {
  const [state, action, pending] = useActionState(createManualOrder, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-terracotta/40 bg-terracotta/8 px-5 py-4 text-sm text-terracotta-deep"
        >
          {state.error}
        </p>
      )}

      <Card>
        <h2 className="text-lg tracking-tight text-charcoal">Customer</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Name *</span>
            <input name="customerName" required className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Phone *</span>
            <input
              name="phone"
              required
              placeholder="0300 1234567"
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs text-sand-600">Address *</span>
            <input name="addressLine" required className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Area *</span>
            <select name="zoneId" required className={field}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} — {formatPKR(z.fee)}
                  {z.minOrder > 0 ? ` (min ${formatPKR(z.minOrder)})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Slot</span>
            <select name="deliverySlot" defaultValue="morning" className={field}>
              <option value="morning">Morning · 9am–12pm</option>
              <option value="afternoon">Afternoon · 12pm–4pm</option>
              <option value="evening">Evening · 4pm–8pm</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg tracking-tight text-charcoal">Items</h2>
        <p className="mt-1 text-sm text-sand-600">
          Only what is left in today&rsquo;s open batch can be sold.
        </p>

        <ul className="mt-4 flex flex-col gap-2">
          {products.map((p) => (
            <li
              key={p.slug}
              className="flex items-center justify-between gap-4 rounded-lg border border-sand-200 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="h-8 w-2 shrink-0 rounded-full"
                  style={{ background: p.accent }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm text-charcoal">{p.name}</p>
                  <p className="text-xs text-sand-600">
                    {formatPKR(p.price)} · {p.size} ·{" "}
                    {p.available > 0 ? (
                      <>{p.available} left</>
                    ) : (
                      <span className="text-terracotta">sold out</span>
                    )}
                  </p>
                </div>
              </div>

              <input
                type="number"
                name={`qty-${p.slug}`}
                min={0}
                max={Math.max(0, p.available)}
                defaultValue={0}
                disabled={p.available <= 0}
                aria-label={`Quantity of ${p.name}`}
                className="w-20 rounded-md border border-sand-300 bg-cream px-2 py-1.5 text-right text-sm tabular-nums disabled:opacity-40"
              />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg tracking-tight text-charcoal">How it came in</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Source</span>
            <select name="source" defaultValue="whatsapp" className={field}>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone call</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Payment</span>
            <select name="paymentMethod" defaultValue="cod" className={field}>
              <option value="cod">Cash on delivery</option>
              <option value="transfer">Bank / JazzCash transfer</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs text-sand-600">Notes</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Landmark, gate code, anything the rider needs"
              className={`${field} resize-none`}
            />
          </label>
        </div>

        <button
          disabled={pending}
          className="mt-5 rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep disabled:opacity-50"
        >
          {pending ? "saving…" : "create order"}
        </button>
        <p className="mt-2 text-xs text-sand-600">
          Saved as confirmed — you took it yourself, so there is nothing to
          confirm. Stock comes out of today&rsquo;s batch immediately.
        </p>
      </Card>
    </form>
  );
}

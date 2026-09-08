import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/orders";
import { formatPKR } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";
import { Card, StatusPill } from "@/components/admin/ui";
import { setOrderStatus, addOrderNote, reviewPayment } from "../../actions";

export const dynamic = "force-dynamic";

const NEXT_ACTIONS: Record<string, { status: string; label: string; tone?: "danger" }[]> = {
  pending: [
    { status: "confirmed", label: "Confirm order" },
    { status: "cancelled", label: "Cancel", tone: "danger" },
  ],
  confirmed: [
    { status: "packed", label: "Mark packed" },
    { status: "cancelled", label: "Cancel", tone: "danger" },
  ],
  packed: [
    { status: "out_for_delivery", label: "Out for delivery" },
    { status: "cancelled", label: "Cancel", tone: "danger" },
  ],
  out_for_delivery: [
    { status: "delivered", label: "Mark delivered" },
    { status: "failed", label: "Delivery failed", tone: "danger" },
  ],
  failed: [
    { status: "out_for_delivery", label: "Retry delivery" },
    { status: "cancelled", label: "Cancel", tone: "danger" },
  ],
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await db.order.findUnique({ where: { id } });
  if (!order) notFound();

  const events = await db.orderEvent.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
  });

  const actions = NEXT_ACTIONS[order.status] ?? [];
  const waMessage = `Hi ${order.customerName.split(" ")[0]}, this is taazo about order ${order.orderNumber}.`;

  return (
    <>
      <Link
        href="/admin/orders"
        className="text-sm text-sand-600 transition-colors hover:text-charcoal"
      >
        ← all orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl tabular-nums tracking-tight text-charcoal">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-sand-600">
            {order.createdAt.toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Karachi",
            })}{" "}
            · batch {order.batchCode ?? "—"} · via {order.source}
          </p>
        </div>
        <StatusPill status={order.status} label={STATUS_LABELS[order.status]} />
      </div>

      {/* Status actions first — this is what you came here to do. */}
      {actions.length > 0 && (
        <Card className="mt-5">
          <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
            next step
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action) => (
              <form key={action.status} action={setOrderStatus}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="status" value={action.status} />
                <button
                  type="submit"
                  className={
                    action.tone === "danger"
                      ? "rounded-full border border-terracotta/40 px-5 py-2.5 text-sm text-terracotta-deep transition-colors hover:bg-terracotta/10"
                      : "rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800"
                  }
                >
                  {action.label}
                </button>
              </form>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-5">
          <Card>
            <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
              items
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {order.items.map((item, i) => (
                <li
                  key={`${item.productSlug}-${i}`}
                  className="flex justify-between gap-4 border-b border-sand-200 pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-base text-charcoal">
                      <span className="tabular-nums">{item.qty}×</span>{" "}
                      {item.nameSnapshot}
                    </p>
                    <p className="text-xs text-sand-600">{item.size}</p>
                    {item.isGiftBox && item.giftItems.length > 0 && (
                      <p className="mt-1 text-xs text-sand-700">
                        contains: {item.giftItems.join(", ")}
                      </p>
                    )}
                    {item.noteCard && (
                      <p className="mt-1.5 rounded-md bg-gold/12 px-3 py-2 text-xs italic text-sand-800">
                        card{item.recipientName ? ` for ${item.recipientName}` : ""}:
                        &ldquo;{item.noteCard}&rdquo;
                      </p>
                    )}
                  </div>
                  <span className="whitespace-nowrap tabular-nums text-charcoal">
                    {formatPKR(item.priceSnapshot * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-sand-600">Subtotal</dt>
                <dd className="tabular-nums">{formatPKR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sand-600">Delivery</dt>
                <dd className="tabular-nums">{formatPKR(order.deliveryFee)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-sand-200 pt-2 text-base">
                <dt className="text-charcoal">Total</dt>
                <dd className="tabular-nums text-charcoal">
                  {formatPKR(order.total)}
                </dd>
              </div>
            </dl>
          </Card>

          {order.paymentMethod === "transfer" && (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
                  bank transfer
                </p>
                <StatusPill status={order.paymentStatus} />
              </div>

              {order.paymentProof ? (
                <>
                  <div className="relative mt-4 aspect-4/3 w-full max-w-sm overflow-hidden rounded-lg bg-sand-200">
                    <Image
                      src={order.paymentProof.url}
                      alt={`Payment proof for ${order.orderNumber}`}
                      fill
                      sizes="384px"
                      className="object-contain"
                    />
                  </div>
                  {order.paymentStatus === "pending" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={reviewPayment}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="decision" value="verify" />
                        <button className="rounded-full bg-olive px-5 py-2.5 text-sm text-cream transition-colors hover:bg-olive-light">
                          verify payment
                        </button>
                      </form>
                      <form action={reviewPayment} className="flex gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="decision" value="reject" />
                        <input
                          name="reason"
                          placeholder="Reason"
                          className="rounded-full border border-sand-300 bg-cream px-4 py-2 text-sm"
                        />
                        <button className="rounded-full border border-terracotta/40 px-4 py-2 text-sm text-terracotta-deep transition-colors hover:bg-terracotta/10">
                          reject
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-sand-600">
                  No screenshot uploaded yet. Ask for it on WhatsApp.
                </p>
              )}
            </Card>
          )}

          <Card>
            <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
              history
            </p>
            <ol className="mt-4 flex flex-col gap-3 text-sm">
              {events.map((event) => (
                <li key={event.id} className="flex justify-between gap-4">
                  <span className="text-charcoal">
                    {STATUS_LABELS[event.toStatus] ?? event.toStatus}
                    {event.note && (
                      <span className="text-sand-600"> — {event.note}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-sand-500">
                    {event.createdAt.toLocaleString("en-PK", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Karachi",
                    })}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
              customer
            </p>
            <p className="mt-3 text-lg text-charcoal">{order.customerName}</p>
            <p className="mt-1 text-sm text-sand-700">{order.addressLine}</p>
            <p className="text-sm text-sand-700">
              {order.area}, {order.city}
            </p>
            <p className="mt-3 text-sm text-sand-600">
              {order.deliveryDate.toLocaleDateString("en-PK", {
                weekday: "short",
                day: "numeric",
                month: "short",
                timeZone: "Asia/Karachi",
              })}{" "}
              · {order.deliverySlot}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`tel:${order.phone.replace(/\s/g, "")}`}
                className="rounded-full bg-sand-200 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-sand-300"
              >
                call {order.phone}
              </a>
              <a
                href={whatsappLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-olive px-4 py-2 text-sm text-cream transition-colors hover:bg-olive-light"
              >
                WhatsApp
              </a>
            </div>
          </Card>

          <Card>
            <form action={addOrderNote}>
              <input type="hidden" name="orderId" value={order.id} />
              <label className="flex flex-col gap-2">
                <span className="text-2xs uppercase tracking-[0.14em] text-sand-500">
                  internal note
                </span>
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={order.notes ?? ""}
                  placeholder="Gate code, rider instructions, anything the next person needs"
                  className="resize-none rounded-lg border border-sand-300 bg-cream px-3 py-2 text-sm text-charcoal focus:border-terracotta focus:outline-none"
                />
              </label>
              <button className="mt-3 w-full rounded-full bg-charcoal px-4 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                save note
              </button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

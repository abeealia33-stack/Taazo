import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { karachiNow } from "@/lib/batch";
import { formatPKR } from "@/lib/utils";
import { AdminHeading, Card, StatCard, EmptyState } from "@/components/admin/ui";
import { reviewPayment } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const startOfDay = karachiNow();
  startOfDay.setHours(0, 0, 0, 0);

  const [awaiting, codToday, collectedToday] = await Promise.all([
    db.order.findMany({
      where: { paymentMethod: "transfer", paymentStatus: "pending" },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      where: {
        paymentMethod: "cod",
        createdAt: { gte: startOfDay },
        status: { notIn: ["cancelled"] },
      },
    }),
    db.order.findMany({
      where: {
        paymentMethod: "cod",
        status: "delivered",
        createdAt: { gte: startOfDay },
      },
    }),
  ]);

  const expected = codToday.reduce((n, o) => n + o.total, 0);
  const collected = collectedToday.reduce((n, o) => n + o.total, 0);

  return (
    <>
      <AdminHeading
        title="Payments"
        subtitle="Verify transfers, and reconcile the cash that came back with the rider."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Awaiting verification"
          value={awaiting.length}
          tone={awaiting.length > 0 ? "alert" : "good"}
        />
        <StatCard label="COD expected today" value={formatPKR(expected)} />
        <StatCard
          label="COD collected"
          value={formatPKR(collected)}
          hint={`${formatPKR(expected - collected)} still out`}
          tone={expected - collected === 0 ? "good" : "default"}
        />
      </div>

      <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">
        Transfers to verify
      </h2>

      {awaiting.length === 0 ? (
        <EmptyState
          title="Nothing to verify"
          body="Every bank transfer has been reviewed."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {awaiting.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-base text-charcoal underline-offset-4 hover:underline"
                  >
                    {order.orderNumber} · {order.customerName}
                  </Link>
                  <p className="mt-1 text-sm text-sand-600">
                    {formatPKR(order.total)} · {order.area} ·{" "}
                    {order.createdAt.toLocaleString("en-PK", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Karachi",
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={reviewPayment}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="decision" value="verify" />
                    <button className="rounded-full bg-olive px-5 py-2.5 text-sm text-cream transition-colors hover:bg-olive-light">
                      verify
                    </button>
                  </form>
                  <form action={reviewPayment} className="flex gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <input
                      name="reason"
                      placeholder="Reason"
                      className="w-36 rounded-full border border-sand-300 bg-cream px-4 py-2 text-sm"
                    />
                    <button className="rounded-full border border-terracotta/40 px-4 py-2 text-sm text-terracotta-deep transition-colors hover:bg-terracotta/10">
                      reject
                    </button>
                  </form>
                </div>
              </div>

              {order.paymentProof ? (
                <div className="relative mt-4 aspect-4/3 w-full max-w-xs overflow-hidden rounded-lg bg-sand-200">
                  <Image
                    src={order.paymentProof.url}
                    alt={`Payment proof for ${order.orderNumber}`}
                    fill
                    sizes="320px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-sand-600">
                  No screenshot uploaded — chase it on WhatsApp.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

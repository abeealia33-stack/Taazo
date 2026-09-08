import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { karachiNow, batchCode, formatTime, nowEpochMs } from "@/lib/batch";
import { getSetting, STATUS_LABELS } from "@/lib/orders";
import { formatPKR } from "@/lib/utils";
import { AdminHeading, Card, StatCard, StatusPill, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminTodayPage() {
  const session = await requireAdmin();

  const local = karachiNow();
  const startOfDay = new Date(local);
  startOfDay.setHours(0, 0, 0, 0);

  const [batch, orders, cutoffHour, unverified] = await Promise.all([
    db.batch.findFirst({ where: { status: "live" }, orderBy: { pressedAt: "desc" } }),
    db.order.findMany({
      where: { createdAt: { gte: startOfDay } },
      orderBy: { createdAt: "desc" },
    }),
    getSetting("sameDayCutoffHour", 13),
    db.order.count({
      where: { paymentMethod: "transfer", paymentStatus: "pending" },
    }),
  ]);

  const byStatus = (status: string) =>
    orders.filter((o) => o.status === status).length;

  const revenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "failed")
    .reduce((n, o) => n + o.total, 0);

  const cashToCollect = orders
    .filter((o) => o.paymentMethod === "cod" && o.status !== "delivered" && o.status !== "cancelled")
    .reduce((n, o) => n + o.total, 0);

  const minutesToCutoff = Math.round(
    (cutoffHour - local.getHours()) * 60 - local.getMinutes(),
  );

  // Orders sitting unconfirmed for more than half an hour need attention.
  const nowMs = nowEpochMs();
  const stale = orders.filter(
    (o) => o.status === "pending" && nowMs - o.createdAt.getTime() > 30 * 60 * 1000,
  );

  const totalBottles = batch?.stock.reduce((n, s) => n + s.available, 0) ?? 0;

  return (
    <>
      <AdminHeading
        title={`Good ${local.getHours() < 12 ? "morning" : local.getHours() < 17 ? "afternoon" : "evening"}, ${session.name.split(" ")[0]}`}
        subtitle={local.toLocaleDateString("en-PK", {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: "Asia/Karachi",
        })}
      />

      {/* Batch strip — the first thing you touch each morning. */}
      <Card className="mb-6 border-terracotta/25 bg-terracotta/[0.04]">
        {batch ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
                live batch
              </p>
              <p className="mt-1 text-xl tracking-tight text-charcoal">
                {batch.code}{" "}
                <span className="text-sm text-sand-600">
                  pressed {formatTime(batch.pressedAt)}
                </span>
              </p>
              <p className="mt-1 text-sm text-sand-700">
                {totalBottles} bottles left across {batch.stock.length} products
              </p>
            </div>
            <Link
              href="/admin/batches"
              className="rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800"
            >
              manage batch
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl tracking-tight text-charcoal">
                No batch is open
              </p>
              <p className="mt-1 text-sm text-sand-700">
                Nothing is in stock on the site until you open today&rsquo;s batch.
              </p>
            </div>
            <Link
              href="/admin/batches"
              className="rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep"
            >
              open today&rsquo;s batch
            </Link>
          </div>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders today" value={orders.length} />
        <StatCard
          label="Awaiting confirmation"
          value={byStatus("pending")}
          tone={byStatus("pending") > 0 ? "alert" : "default"}
        />
        <StatCard label="Out for delivery" value={byStatus("out_for_delivery")} />
        <StatCard
          label="Revenue today"
          value={formatPKR(revenue)}
          hint={`${formatPKR(cashToCollect)} cash to collect`}
        />
      </div>

      {/* Action queue */}
      {(stale.length > 0 || unverified > 0) && (
        <Card className="mt-6 border-gold/40 bg-gold/[0.07]">
          <p className="text-2xs uppercase tracking-[0.14em] text-sand-600">
            needs you
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {stale.length > 0 && (
              <li>
                <Link href="/admin/orders?status=pending" className="text-charcoal underline underline-offset-4">
                  {stale.length} order{stale.length > 1 ? "s" : ""} unconfirmed for over 30 minutes
                </Link>
              </li>
            )}
            {unverified > 0 && (
              <li>
                <Link href="/admin/payments" className="text-charcoal underline underline-offset-4">
                  {unverified} bank transfer{unverified > 1 ? "s" : ""} awaiting verification
                </Link>
              </li>
            )}
          </ul>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg tracking-tight text-charcoal">Today&rsquo;s orders</h2>
        <p className="text-sm text-sand-600">
          {minutesToCutoff > 0
            ? `Same-day cutoff in ${Math.floor(minutesToCutoff / 60)}h ${minutesToCutoff % 60}m`
            : "Same-day ordering closed"}
        </p>
      </div>

      <div className="mt-4">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet today"
            body={
              batch
                ? `Batch ${batchCode()} is live on the site and taking orders.`
                : "Open today's batch to start taking orders."
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.slice(0, 12).map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-sand-200 bg-cream px-4 py-3.5 transition-colors hover:border-sand-300 hover:bg-sand-100"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base text-charcoal">
                      {order.customerName}{" "}
                      <span className="text-sm text-sand-500">{order.area}</span>
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-sand-600">
                      {order.orderNumber} ·{" "}
                      {order.createdAt.toLocaleTimeString("en-PK", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Asia/Karachi",
                      })}{" "}
                      · {order.paymentMethod === "cod" ? "COD" : "transfer"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="tabular-nums text-charcoal">
                      {formatPKR(order.total)}
                    </span>
                    <StatusPill
                      status={order.status}
                      label={STATUS_LABELS[order.status]}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

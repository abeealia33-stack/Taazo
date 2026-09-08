import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { karachiNow } from "@/lib/batch";
import { STATUS_LABELS } from "@/lib/orders";
import { formatPKR } from "@/lib/utils";
import { AdminHeading, Card, StatCard, StatusPill, EmptyState } from "@/components/admin/ui";
import {
  createRider,
  toggleRider,
  assignRider,
  dispatchRider,
  markAllPacked,
} from "./actions";

export const dynamic = "force-dynamic";

/** Orders still in play today — anything not delivered, failed or cancelled. */
const OPEN_STATUSES = ["pending", "confirmed", "packed", "out_for_delivery"];

export default async function AdminDeliveryPage() {
  await requireAdmin();

  const startOfDay = karachiNow();
  startOfDay.setHours(0, 0, 0, 0);

  const [orders, riders, zones] = await Promise.all([
    db.order.findMany({
      where: { status: { in: OPEN_STATUSES }, createdAt: { gte: startOfDay } },
      orderBy: { createdAt: "asc" },
    }),
    db.rider.findMany({ orderBy: { name: "asc" } }),
    db.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const activeRiders = riders.filter((r) => r.active);
  const nameOfZone = (id: string | null) =>
    zones.find((z) => z.id === id)?.name ?? "Unzoned";

  // Group by zone: a run is planned by area, not by the order it came in.
  const byZone = new Map<string, typeof orders>();
  for (const order of orders) {
    const key = nameOfZone(order.zoneId);
    byZone.set(key, [...(byZone.get(key) ?? []), order]);
  }

  // The pack list: how many of each product to prepare, across every open order.
  const packList = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      packList.set(
        item.nameSnapshot,
        (packList.get(item.nameSnapshot) ?? 0) + item.qty,
      );
    }
  }

  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const packed = orders.filter((o) => o.status === "packed").length;
  const out = orders.filter((o) => o.status === "out_for_delivery").length;
  const unassigned = orders.filter(
    (o) => !o.riderId && o.status !== "pending",
  ).length;

  return (
    <>
      <AdminHeading
        title="Delivery"
        subtitle="Pack, assign and dispatch today's run."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="To pack" value={confirmed} tone={confirmed > 0 ? "alert" : "default"} />
        <StatCard label="Packed" value={packed} />
        <StatCard label="Out for delivery" value={out} />
        <StatCard
          label="No rider yet"
          value={unassigned}
          tone={unassigned > 0 ? "alert" : "good"}
        />
      </div>

      {/* Pack list ------------------------------------------------------ */}
      <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">
        Pack list
      </h2>
      {packList.size === 0 ? (
        <EmptyState title="Nothing to pack" body="No open orders today." />
      ) : (
        <Card>
          <p className="text-sm text-sand-600">
            Everything across today&rsquo;s open orders, totalled. Pack this,
            then split it by the runs below.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[...packList.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([name, qty]) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-lg bg-sand-100 px-4 py-2.5"
                >
                  <span className="min-w-0 truncate text-sm text-charcoal">
                    {name}
                  </span>
                  <span className="shrink-0 text-lg tabular-nums text-charcoal">
                    {qty}
                  </span>
                </li>
              ))}
          </ul>

          {confirmed > 0 && (
            <form action={markAllPacked} className="mt-5">
              <button className="rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                mark all {confirmed} confirmed order{confirmed === 1 ? "" : "s"} as packed
              </button>
            </form>
          )}
        </Card>
      )}

      {/* Runs by zone --------------------------------------------------- */}
      <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">
        Today&rsquo;s runs
      </h2>

      {orders.length === 0 ? (
        <EmptyState title="Nothing out today" body="No open orders." />
      ) : (
        <div className="flex flex-col gap-4">
          {[...byZone.entries()].map(([zone, zoneOrders]) => (
            <Card key={zone}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base text-charcoal">{zone}</h3>
                <p className="text-xs text-sand-600">
                  {zoneOrders.length} {zoneOrders.length === 1 ? "stop" : "stops"} ·{" "}
                  {formatPKR(zoneOrders.reduce((n, o) => n + o.total, 0))}
                </p>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {zoneOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-sand-200 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-charcoal underline-offset-4 hover:underline"
                      >
                        {order.customerName}
                      </Link>
                      <p className="truncate text-xs text-sand-600">
                        {order.addressLine} · {order.deliverySlot} ·{" "}
                        {order.paymentMethod === "cod"
                          ? `collect ${formatPKR(order.total)}`
                          : "paid by transfer"}
                      </p>
                    </div>

                    <StatusPill
                      status={order.status}
                      label={STATUS_LABELS[order.status]}
                    />

                    <form action={assignRider} className="flex items-center gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="riderId"
                        defaultValue={order.riderId ?? ""}
                        className="rounded-md border border-sand-300 bg-cream px-2.5 py-1.5 text-xs"
                      >
                        <option value="">No rider</option>
                        {activeRiders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-full bg-sand-200 px-3 py-1.5 text-xs text-charcoal transition-colors hover:bg-sand-300">
                        assign
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {/* Riders --------------------------------------------------------- */}
      <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">Riders</h2>

      <div className="flex flex-col gap-3">
        {riders.map((rider) => {
          const theirs = orders.filter((o) => o.riderId === rider.id);
          const readyToGo = theirs.filter((o) => o.status === "packed").length;
          const cash = theirs
            .filter((o) => o.paymentMethod === "cod")
            .reduce((n, o) => n + o.total, 0);

          return (
            <Card key={rider.id} className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-base text-charcoal">
                  {rider.name}
                  {!rider.active && (
                    <span className="ml-2 text-xs text-sand-500">unavailable</span>
                  )}
                </p>
                <p className="text-xs text-sand-600">
                  <a
                    href={`tel:${rider.phone.replace(/\s/g, "")}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {rider.phone}
                  </a>{" "}
                  · {theirs.length} assigned
                  {cash > 0 && ` · ${formatPKR(cash)} to collect`}
                </p>
              </div>

              {readyToGo > 0 && (
                <form action={dispatchRider}>
                  <input type="hidden" name="riderId" value={rider.id} />
                  <button className="rounded-full bg-terracotta px-4 py-2 text-xs text-cream transition-colors hover:bg-terracotta-deep">
                    send out {readyToGo}
                  </button>
                </form>
              )}

              <form action={toggleRider}>
                <input type="hidden" name="riderId" value={rider.id} />
                <button
                  className={
                    rider.active
                      ? "rounded-full bg-olive/15 px-4 py-2 text-xs text-olive transition-colors hover:bg-olive/25"
                      : "rounded-full bg-sand-300 px-4 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                  }
                >
                  {rider.active ? "available" : "unavailable"}
                </button>
              </form>
            </Card>
          );
        })}

        <Card className="border-terracotta/25 bg-terracotta/[0.04]">
          <h3 className="text-base text-charcoal">Add a rider</h3>
          <form
            action={createRider}
            className="mt-4 flex flex-wrap items-end gap-3"
          >
            <label className="flex min-w-40 flex-1 flex-col gap-1.5">
              <span className="text-xs text-sand-600">Name</span>
              <input
                name="name"
                required
                placeholder="Bilal"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>
            <label className="flex min-w-40 flex-1 flex-col gap-1.5">
              <span className="text-xs text-sand-600">Phone</span>
              <input
                name="phone"
                required
                placeholder="0300 1234567"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>
            <button className="rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              add rider
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}

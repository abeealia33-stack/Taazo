import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/orders";
import { formatPKR, cn } from "@/lib/utils";
import { AdminHeading, StatusPill, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const { status = "all", q } = await searchParams;

  const orders = await db.order.findMany({
    where: {
      ...(status !== "all" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q } },
              { customerName: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <AdminHeading
        title="Orders"
        subtitle={`${orders.length} shown${status !== "all" ? ` · ${STATUS_LABELS[status] ?? status}` : ""}`}
        action={{ href: "/admin/orders/new", label: "+ new order" }}
      />

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search order number, name or phone"
          className="w-full rounded-lg border border-sand-300 bg-cream px-4 py-2.5 text-base text-charcoal placeholder:text-sand-400 focus:border-terracotta focus:outline-none"
        />
        {status !== "all" && <input type="hidden" name="status" value={status} />}
      </form>

      <nav aria-label="Filter orders" className="mb-5 overflow-x-auto">
        <ul className="flex min-w-max gap-1.5">
          {FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <li key={f.value}>
                <Link
                  href={
                    f.value === "all"
                      ? "/admin/orders"
                      : `/admin/orders?status=${f.value}`
                  }
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "block rounded-full px-3.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-charcoal text-cream"
                      : "bg-sand-200 text-sand-700 hover:bg-sand-300",
                  )}
                >
                  {f.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {orders.length === 0 ? (
        <EmptyState title="Nothing here" body="No orders match this filter." />
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-sand-200 bg-cream px-4 py-3.5 transition-colors hover:border-sand-300 hover:bg-sand-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-base text-charcoal">
                    {order.customerName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-sand-600">
                    <span className="tabular-nums">{order.orderNumber}</span> ·{" "}
                    {order.area} ·{" "}
                    {order.createdAt.toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Asia/Karachi",
                    })}
                    {order.paymentMethod === "transfer" &&
                      order.paymentStatus === "pending" && (
                        <span className="text-terracotta"> · proof pending</span>
                      )}
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
    </>
  );
}

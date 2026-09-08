import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { karachiNow } from "@/lib/batch";
import { formatPKR } from "@/lib/utils";
import { AdminHeading, Card, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/**
 * Deliberately few reports, each tied to a decision. No vanity metrics —
 * every number here should change what gets pressed, promoted or dropped.
 */
export default async function AdminReportsPage() {
  await requireOwner();

  const now = karachiNow();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [orders, batches] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
    }),
    db.batch.findMany({
      where: { pressedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  const valid = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "failed",
  );
  const revenue = valid.reduce((n, o) => n + o.total, 0);
  const aov = valid.length > 0 ? Math.round(revenue / valid.length) : 0;

  // Repeat customers, keyed by phone — phone is identity in this business.
  const byPhone = new Map<string, number>();
  for (const o of valid) byPhone.set(o.phone, (byPhone.get(o.phone) ?? 0) + 1);
  const repeat = [...byPhone.values()].filter((n) => n > 1).length;
  const repeatRate =
    byPhone.size > 0 ? Math.round((repeat / byPhone.size) * 100) : 0;

  const failed = orders.filter((o) => o.status === "failed");
  const failRate =
    orders.length > 0 ? Math.round((failed.length / orders.length) * 100) : 0;

  // Sold-through vs wasted — the number that decides tomorrow's pressing.
  const perProduct = new Map<
    string,
    { made: number; sold: number; unsold: number; wasted: number }
  >();
  for (const b of batches) {
    for (const s of b.stock) {
      const row = perProduct.get(s.productSlug) ?? {
        made: 0,
        sold: 0,
        unsold: 0,
        wasted: 0,
      };
      row.made += s.bottlesMade;
      row.sold += s.bottlesSold;
      row.unsold += s.unsold;
      row.wasted += s.wasted;
      perProduct.set(s.productSlug, row);
    }
  }

  const byArea = new Map<string, { count: number; revenue: number }>();
  for (const o of valid) {
    const row = byArea.get(o.area) ?? { count: 0, revenue: 0 };
    row.count += 1;
    row.revenue += o.total;
    byArea.set(o.area, row);
  }

  const products = await db.product.findMany();
  const nameOf = (slug: string) =>
    products.find((p) => p.slug === slug)?.name ?? slug;

  return (
    <>
      <AdminHeading title="Reports" subtitle="Last 30 days" />

      {/* Plain links, not fetch calls: the browser handles the download and
          this keeps working with JavaScript disabled. */}
      <Card className="mb-5">
        <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
          export
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/api/admin/export?type=orders&days=90"
            className="rounded-full bg-sand-200 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-sand-300"
          >
            orders (90 days) &middot; CSV
          </a>
          <a
            href="/api/admin/export?type=batches&days=90"
            className="rounded-full bg-sand-200 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-sand-300"
          >
            batches &amp; wastage &middot; CSV
          </a>
          <a
            href="/api/admin/export?type=customers"
            className="rounded-full bg-sand-200 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-sand-300"
          >
            customers &middot; CSV
          </a>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatPKR(revenue)} />
        <StatCard label="Orders" value={valid.length} />
        <StatCard label="Average order" value={formatPKR(aov)} />
        <StatCard
          label="Repeat customers"
          value={`${repeatRate}%`}
          hint={`${repeat} of ${byPhone.size} customers`}
          tone={repeatRate >= 25 ? "good" : "default"}
        />
      </div>

      <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">
        Sold through vs wasted
      </h2>
      <p className="mb-4 text-sm text-sand-600">
        The most useful number in the business: it tells you how much of each
        product to press tomorrow.
      </p>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-2xl text-sm">
          <thead>
            <tr className="border-b border-sand-200 text-left text-2xs uppercase tracking-[0.12em] text-sand-500">
              <th className="pb-2">Product</th>
              <th className="pb-2 text-right">Made</th>
              <th className="pb-2 text-right">Sold</th>
              <th className="pb-2 text-right">Unsold</th>
              <th className="pb-2 text-right">Wasted</th>
              <th className="pb-2 text-right">Sold through</th>
            </tr>
          </thead>
          <tbody>
            {[...perProduct.entries()]
              .sort((a, b) => b[1].sold - a[1].sold)
              .map(([slug, row]) => {
                const rate =
                  row.made > 0 ? Math.round((row.sold / row.made) * 100) : 0;
                return (
                  <tr key={slug} className="border-b border-sand-100">
                    <td className="py-2.5 text-charcoal">{nameOf(slug)}</td>
                    <td className="py-2.5 text-right tabular-nums">{row.made}</td>
                    <td className="py-2.5 text-right tabular-nums">{row.sold}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {row.unsold}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-terracotta">
                      {row.wasted}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-charcoal">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            {perProduct.size === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sand-600">
                  No closed batches yet — close a batch to start collecting this.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg tracking-tight text-charcoal">Orders by area</h2>
          <p className="mt-1 text-sm text-sand-600">
            Where to expand delivery, and where it is costing you.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {[...byArea.entries()]
              .sort((a, b) => b[1].revenue - a[1].revenue)
              .slice(0, 8)
              .map(([area, row]) => (
                <li
                  key={area}
                  className="flex justify-between border-b border-sand-100 pb-2"
                >
                  <span className="text-charcoal">{area}</span>
                  <span className="tabular-nums text-sand-700">
                    {row.count} · {formatPKR(row.revenue)}
                  </span>
                </li>
              ))}
            {byArea.size === 0 && (
              <li className="py-6 text-center text-sand-600">No orders yet.</li>
            )}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg tracking-tight text-charcoal">
            Failed deliveries
          </h2>
          <p className="mt-1 text-sm text-sand-600">
            Every failure is a bottle you paid for and a trip you did not get paid
            for.
          </p>
          <p className="mt-5 text-4xl tabular-nums text-charcoal">
            {failRate}%
          </p>
          <p className="mt-1 text-sm text-sand-600">
            {failed.length} of {orders.length} orders in the last 30 days
          </p>
        </Card>
      </div>
    </>
  );
}

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTime, karachiNow } from "@/lib/batch";
import { AdminHeading, Card, StatusPill } from "@/components/admin/ui";
import {
  openBatch,
  closeBatch,
  adjustStock,
  runReservationSweep,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBatchesPage() {
  await requireAdmin();

  const [live, products, history] = await Promise.all([
    db.batch.findFirst({ where: { status: "live" }, orderBy: { pressedAt: "desc" } }),
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.batch.findMany({
      where: { status: "closed" },
      orderBy: { pressedAt: "desc" },
      take: 14,
    }),
  ]);

  const now = karachiNow();

  return (
    <>
      <AdminHeading
        title="Batches"
        subtitle="Opening a batch puts stock on the site and starts the live counter. Closing it records what did not sell."
      />

      {live ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl tracking-tight text-charcoal">
                  {live.code}
                </h2>
                <StatusPill status="confirmed" label="live" />
              </div>
              <p className="mt-1 text-sm text-sand-600">
                pressed {formatTime(live.pressedAt)} · {live.city}
              </p>
              {live.note && (
                <p className="mt-2 text-sm italic text-sand-700">
                  &ldquo;{live.note}&rdquo; — shown on the site
                </p>
              )}
            </div>
            <form action={runReservationSweep}>
              <button className="rounded-full border border-sand-300 px-4 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-200">
                release stuck reservations
              </button>
            </form>
          </div>

          {/* Six columns will not fit a phone, and this is the screen used at
              6am with one hand. Scroll it rather than squashing it. */}
          <div className="-mx-5 mt-6 overflow-x-auto px-5">
            <table className="w-full min-w-2xl text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-left text-2xs uppercase tracking-[0.12em] text-sand-500">
                <th className="pb-2">Product</th>
                <th className="pb-2 text-right">Made</th>
                <th className="pb-2 text-right">Sold</th>
                <th className="pb-2 text-right">Held</th>
                <th className="pb-2 text-right">Left</th>
                <th className="pb-2 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {live.stock.map((row) => {
                const product = products.find((p) => p.slug === row.productSlug);
                return (
                  <tr key={row.productSlug} className="border-b border-sand-100">
                    <td className="py-3 text-charcoal">
                      {product?.name ?? row.productSlug}
                    </td>
                    <td className="py-3 text-right tabular-nums text-sand-700">
                      {row.bottlesMade}
                    </td>
                    <td className="py-3 text-right tabular-nums text-sand-700">
                      {row.bottlesSold}
                    </td>
                    <td className="py-3 text-right tabular-nums text-sand-500">
                      {row.reserved}
                    </td>
                    <td className="py-3 text-right tabular-nums text-charcoal">
                      {row.available}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        {[-1, 1].map((delta) => (
                          <form key={delta} action={adjustStock}>
                            <input type="hidden" name="batchId" value={live.id} />
                            <input
                              type="hidden"
                              name="productSlug"
                              value={row.productSlug}
                            />
                            <input type="hidden" name="delta" value={delta} />
                            <button
                              aria-label={`${delta > 0 ? "Add" : "Remove"} one ${product?.name ?? row.productSlug}`}
                              className="grid h-8 w-8 place-items-center rounded-full bg-sand-200 transition-colors hover:bg-sand-300"
                            >
                              {delta > 0 ? "+" : "−"}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          <details className="mt-6 border-t border-sand-200 pt-5">
            <summary className="cursor-pointer text-sm text-sand-700">
              Close this batch for the day
            </summary>
            <form action={closeBatch} className="mt-4">
              <input type="hidden" name="batchId" value={live.id} />
              <p className="text-sm text-sand-600">
                Anything left becomes unsold. Record how many you had to throw
                away — over a fortnight this tells you exactly how much to press.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {live.stock.map((row) => {
                  const product = products.find((p) => p.slug === row.productSlug);
                  return (
                    <label
                      key={row.productSlug}
                      className="flex items-center justify-between gap-3 rounded-lg bg-sand-100 px-4 py-2.5"
                    >
                      <span className="text-sm text-charcoal">
                        {product?.name ?? row.productSlug}
                        <span className="block text-xs text-sand-600">
                          {row.available} left
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-sand-600">wasted</span>
                        <input
                          type="number"
                          min={0}
                          defaultValue={0}
                          name={`wasted-${row.productSlug}`}
                          className="w-16 rounded-md border border-sand-300 bg-cream px-2 py-1.5 text-right text-sm tabular-nums"
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
              <button className="mt-4 rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                close batch {live.code}
              </button>
            </form>
          </details>
        </Card>
      ) : (
        <Card className="border-terracotta/30 bg-terracotta/[0.04]">
          <h2 className="text-xl tracking-tight text-charcoal">
            Open today&rsquo;s batch
          </h2>
          <p className="mt-1 text-sm text-sand-700">
            Nothing is in stock on the site until you do this.
          </p>

          <form action={openBatch} className="mt-5">
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-sand-600">Pressed at</span>
                <span className="flex items-center gap-1">
                  <input
                    type="number"
                    name="pressedHour"
                    min={0}
                    max={23}
                    defaultValue={Math.min(now.getHours(), 23)}
                    className="w-16 rounded-md border border-sand-300 bg-cream px-2 py-2 text-center text-sm tabular-nums"
                  />
                  <span className="text-sand-500">:</span>
                  <input
                    type="number"
                    name="pressedMinute"
                    min={0}
                    max={59}
                    defaultValue={now.getMinutes()}
                    className="w-16 rounded-md border border-sand-300 bg-cream px-2 py-2 text-center text-sm tabular-nums"
                  />
                </span>
              </label>
              <label className="flex min-w-56 flex-1 flex-col gap-1.5">
                <span className="text-xs text-sand-600">
                  Note for the site (optional)
                </span>
                <input
                  name="note"
                  maxLength={160}
                  placeholder="Mangoes are especially good today"
                  className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                />
              </label>
            </div>

            <p className="mt-6 text-2xs uppercase tracking-[0.14em] text-sand-500">
              bottles made
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <label
                  key={p.slug}
                  className="flex items-center justify-between gap-3 rounded-lg bg-cream px-4 py-2.5 ring-1 ring-sand-200"
                >
                  <span className="text-sm text-charcoal">{p.name}</span>
                  <input
                    type="number"
                    min={0}
                    defaultValue={0}
                    name={`made-${p.slug}`}
                    className="w-20 rounded-md border border-sand-300 bg-cream px-2 py-1.5 text-right text-sm tabular-nums"
                  />
                </label>
              ))}
            </div>

            <button className="mt-5 rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              open batch &amp; go live
            </button>
          </form>
        </Card>
      )}

      {history.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">
            Recent batches
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-left text-2xs uppercase tracking-[0.12em] text-sand-500">
                  <th className="pb-2">Batch</th>
                  <th className="pb-2 text-right">Made</th>
                  <th className="pb-2 text-right">Sold</th>
                  <th className="pb-2 text-right">Unsold</th>
                  <th className="pb-2 text-right">Wasted</th>
                  <th className="pb-2 text-right">Sold through</th>
                </tr>
              </thead>
              <tbody>
                {history.map((b) => {
                  const made = b.stock.reduce((n, s) => n + s.bottlesMade, 0);
                  const sold = b.stock.reduce((n, s) => n + s.bottlesSold, 0);
                  const unsold = b.stock.reduce((n, s) => n + s.unsold, 0);
                  const wasted = b.stock.reduce((n, s) => n + s.wasted, 0);
                  const rate = made > 0 ? Math.round((sold / made) * 100) : 0;
                  return (
                    <tr key={b.id} className="border-b border-sand-100">
                      <td className="py-2.5 tabular-nums text-charcoal">
                        {b.code}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{made}</td>
                      <td className="py-2.5 text-right tabular-nums">{sold}</td>
                      <td className="py-2.5 text-right tabular-nums">{unsold}</td>
                      <td className="py-2.5 text-right tabular-nums text-terracotta">
                        {wasted}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-charcoal">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

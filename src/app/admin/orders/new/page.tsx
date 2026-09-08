import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAvailability } from "@/lib/liveBatch";
import { AdminHeading, Card } from "@/components/admin/ui";
import { ManualOrderForm } from "./ManualOrderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  await requireAdmin();

  const [products, zones, availability, batch] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.deliveryZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getAvailability(),
    db.batch.findFirst({ where: { status: "live" } }),
  ]);

  return (
    <>
      <Link
        href="/admin/orders"
        className="text-sm text-sand-600 transition-colors hover:text-charcoal"
      >
        ← all orders
      </Link>

      <div className="mt-4">
        <AdminHeading
          title="New order"
          subtitle="For orders that arrived on WhatsApp or by phone, so they land in the same system as the website's."
        />
      </div>

      {!batch ? (
        <Card className="border-terracotta/30 bg-terracotta/[0.04]">
          <p className="text-base text-charcoal">No batch is open</p>
          <p className="mt-1 text-sm text-sand-700">
            Stock comes out of the live batch, so open one first.
          </p>
          <Link
            href="/admin/batches"
            className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep"
          >
            open today&rsquo;s batch
          </Link>
        </Card>
      ) : zones.length === 0 ? (
        <Card>
          <p className="text-base text-charcoal">No delivery zones</p>
          <p className="mt-1 text-sm text-sand-700">
            Add at least one zone in Settings before taking orders.
          </p>
        </Card>
      ) : (
        <ManualOrderForm
          products={products.map((p) => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            size: p.size,
            accent: p.accent,
            available: availability.get(p.slug) ?? 0,
          }))}
          zones={zones.map((z) => ({
            id: z.id,
            name: z.name,
            fee: z.fee,
            minOrder: z.minOrder,
          }))}
        />
      )}
    </>
  );
}

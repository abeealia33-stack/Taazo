import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/utils";
import { AdminHeading, Card, EmptyState } from "@/components/admin/ui";
import { toggleProduct } from "../actions";
import { reorderProduct } from "../catalog-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await requireAdmin();

  const [products, categories] = await Promise.all([
    db.product.findMany({ orderBy: { sortOrder: "asc" } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const live = products.filter((p) => !p.archivedAt);
  const archived = products.filter((p) => p.archivedAt);
  const nameOfCategory = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <AdminHeading
        title="Products"
        subtitle="Order here is the order on the shop. Changes go live immediately."
        action={
          session.role === "owner"
            ? { href: "/admin/products/new", label: "+ new product" }
            : undefined
        }
      />

      {live.length === 0 ? (
        <EmptyState
          title="No products yet"
          body="Create your first one, then open a batch to give it stock."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {live.map((product, i) => (
            <li key={product.id}>
              <Card className="flex flex-wrap items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand-200">
                  {product.photos[0] ? (
                    <Image
                      src={product.photos[0]}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className="absolute inset-0"
                      style={{
                        background: `color-mix(in oklab, ${product.accent} 35%, var(--color-cream))`,
                      }}
                      aria-label="No photo yet"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-base text-charcoal underline-offset-4 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-sand-600">
                    {nameOfCategory(product.category)} · {formatPKR(product.price)}
                    {product.size ? ` · ${product.size}` : ""}
                    {product.featured && " · featured"}
                    {product.photos.length === 0 && (
                      <span className="text-terracotta"> · no photo</span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <form action={reorderProduct}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      disabled={i === 0}
                      aria-label={`Move ${product.name} up`}
                      className="grid h-8 w-8 place-items-center rounded-full bg-sand-200 transition-colors hover:bg-sand-300 disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={reorderProduct}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      disabled={i === live.length - 1}
                      aria-label={`Move ${product.name} down`}
                      className="grid h-8 w-8 place-items-center rounded-full bg-sand-200 transition-colors hover:bg-sand-300 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>

                  <form action={toggleProduct}>
                    <input type="hidden" name="productId" value={product.id} />
                    <button
                      className={
                        product.active
                          ? "rounded-full bg-olive/15 px-4 py-2 text-xs text-olive transition-colors hover:bg-olive/25"
                          : "rounded-full bg-sand-300 px-4 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                      }
                    >
                      {product.active ? "visible" : "hidden"}
                    </button>
                  </form>

                  <Link
                    href={`/admin/products/${product.id}`}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs text-cream transition-colors hover:bg-sand-800"
                  >
                    edit
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">
            Archived
          </h2>
          <ul className="flex flex-col gap-2">
            {archived.map((product) => (
              <li key={product.id}>
                <Card className="flex items-center justify-between gap-4 opacity-70">
                  <span className="text-sm text-charcoal">{product.name}</span>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-xs text-sand-600 underline-offset-4 hover:underline"
                  >
                    restore
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

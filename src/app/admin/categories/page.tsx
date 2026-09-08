import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading, Card, EmptyState } from "@/components/admin/ui";
import {
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
  assignProductToCategory,
} from "../catalog-actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireOwner();

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.product.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const live = products.filter((p) => !p.archivedAt);
  const productsIn = (slug: string) => live.filter((p) => p.category === slug);
  const nameOfCategory = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <AdminHeading
        title="Categories"
        subtitle="These become the filter buttons on the shop page, in this order."
      />

      <Card className="mb-6 border-terracotta/25 bg-terracotta/[0.04]">
        <h2 className="text-lg tracking-tight text-charcoal">New category</h2>
        <form action={createCategory} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Name</span>
            <input
              name="name"
              required
              placeholder="Smoothies"
              className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">
              URL slug <span className="text-sand-500">(optional)</span>
            </span>
            <input
              name="slug"
              placeholder="auto-generated from the name"
              className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs text-sand-600">
              Description <span className="text-sand-500">(optional)</span>
            </span>
            <input
              name="description"
              placeholder="Blended fresh, no syrup."
              className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
            />
          </label>
          <label className="flex w-32 flex-col gap-1.5">
            <span className="text-xs text-sand-600">Order</span>
            <input
              type="number"
              name="sortOrder"
              min={0}
              defaultValue={categories.length + 1}
              className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm tabular-nums"
            />
          </label>
          <div className="flex items-end sm:col-span-2">
            <button className="rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              create category
            </button>
          </div>
        </form>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" body="Create one above." />
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((category) => {
            const inCategory = productsIn(category.slug);
            const used = inCategory.length;
            const elsewhere = live.filter((p) => p.category !== category.slug);
            return (
              <Card key={category.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg tracking-tight text-charcoal">
                      {category.name}
                      {!category.active && (
                        <span className="ml-2 text-xs text-sand-500">hidden</span>
                      )}
                    </h2>
                    <p className="mt-0.5 text-xs text-sand-600">
                      /shop?category={category.slug} · {used}{" "}
                      {used === 1 ? "product" : "products"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form action={toggleCategory}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <button
                        className={
                          category.active
                            ? "rounded-full bg-olive/15 px-4 py-2 text-xs text-olive transition-colors hover:bg-olive/25"
                            : "rounded-full bg-sand-300 px-4 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                        }
                      >
                        {category.active ? "visible — hide" : "hidden — show"}
                      </button>
                    </form>

                    <form action={deleteCategory}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <button
                        disabled={used > 0}
                        title={
                          used > 0
                            ? "Move or archive its products first"
                            : "Delete this category"
                        }
                        className="rounded-full border border-terracotta/40 px-4 py-2 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        delete
                      </button>
                    </form>
                  </div>
                </div>

                {/* Products in this category, and a way to move more in. */}
                <div className="mt-4 border-t border-sand-200 pt-4">
                  <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
                    products in this category
                  </p>

                  {inCategory.length === 0 ? (
                    <p className="mt-2 text-sm text-sand-600">
                      Nothing here yet — add one below.
                    </p>
                  ) : (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {inCategory.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="inline-flex items-center gap-2 rounded-full bg-sand-200 px-3 py-1.5 text-xs text-charcoal transition-colors hover:bg-sand-300"
                          >
                            <span
                              aria-hidden
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: p.accent }}
                            />
                            {p.name}
                            {!p.active && (
                              <span className="text-sand-500">hidden</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {elsewhere.length > 0 && (
                    <form
                      action={assignProductToCategory}
                      className="mt-4 flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="categoryId" value={category.id} />
                      <label className="flex min-w-56 flex-1 flex-col gap-1.5">
                        <span className="text-xs text-sand-600">
                          Add a product
                        </span>
                        <select
                          name="productId"
                          defaultValue=""
                          className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
                        >
                          <option value="" disabled>
                            Choose a product…
                          </option>
                          {elsewhere.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — currently in {nameOfCategory(p.category)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button className="rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                        add to {category.name}
                      </button>
                    </form>
                  )}

                  <p className="mt-2 text-xs text-sand-600">
                    A product belongs to one category at a time, so adding it
                    here moves it out of its current one.
                  </p>
                </div>

                <details className="mt-4 border-t border-sand-200 pt-4">
                  <summary className="cursor-pointer text-sm text-sand-700">
                    Edit
                  </summary>
                  <form action={updateCategory} className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="categoryId" value={category.id} />
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs text-sand-600">Name</span>
                      <input
                        name="name"
                        defaultValue={category.name}
                        className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs text-sand-600">Order</span>
                      <input
                        type="number"
                        name="sortOrder"
                        min={0}
                        defaultValue={category.sortOrder}
                        className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm tabular-nums"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className="text-xs text-sand-600">Description</span>
                      <input
                        name="description"
                        defaultValue={category.description ?? ""}
                        className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <button className="rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                        save
                      </button>
                    </div>
                  </form>
                </details>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

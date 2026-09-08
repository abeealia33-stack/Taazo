import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/utils";
import { AdminHeading, Card } from "@/components/admin/ui";
import { updateProduct } from "../../actions";
import { IMAGE_MAX_BYTES } from "@/lib/storage";
import {
  removeProductPhoto,
  makePrimaryPhoto,
  archiveProduct,
  restoreProduct,
} from "../../catalog-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  const canEdit = session.role === "owner";

  return (
    <>
      <Link
        href="/admin/products"
        className="text-sm text-sand-600 transition-colors hover:text-charcoal"
      >
        ← all products
      </Link>

      <div className="mt-4">
        <AdminHeading
          title={product.name}
          subtitle={`${formatPKR(product.price)} · ${product.size || "no size set"} · /shop/${product.slug}`}
          action={{ href: `/shop/${product.slug}`, label: "view on site" }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Photos */}
        <Card>
          <h2 className="text-lg tracking-tight text-charcoal">Photos</h2>
          <p className="mt-1 text-sm text-sand-600">
            The first photo is the one used on the shop card and as the hero.
          </p>

          {product.photos.length === 0 ? (
            <p className="mt-5 rounded-lg bg-sand-100 px-4 py-6 text-center text-sm text-sand-600">
              No photos yet — the site is showing a designed placeholder in this
              product&rsquo;s accent colour.
            </p>
          ) : (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {product.photos.map((url, i) => (
                <li key={url} className="flex flex-col gap-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-sand-200">
                    <Image
                      src={url}
                      alt={`${product.name} photo ${i + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-charcoal/85 px-2 py-1 text-2xs uppercase tracking-[0.1em] text-cream">
                        primary
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {i !== 0 && (
                      <form action={makePrimaryPhoto} className="flex-1">
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="url" value={url} />
                        <button className="w-full rounded-full bg-sand-200 px-2 py-1.5 text-2xs text-charcoal transition-colors hover:bg-sand-300">
                          make primary
                        </button>
                      </form>
                    )}
                    <form action={removeProductPhoto} className="flex-1">
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="url" value={url} />
                      <button className="w-full rounded-full border border-terracotta/40 px-2 py-1.5 text-2xs text-terracotta-deep transition-colors hover:bg-terracotta/10">
                        remove
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/*
            Posts to the route handler rather than a Server Action: route
            handlers stream the request body with no size cap, so a
            full-resolution photo is never silently rejected.
          */}
          <form
            action="/api/admin/upload"
            method="post"
            encType="multipart/form-data"
            className="mt-5 flex flex-col gap-3 border-t border-sand-200 pt-5"
          >
            <input type="hidden" name="intent" value="product-photo" />
            <input type="hidden" name="productId" value={product.id} />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">
                Add photos{" "}
                <span className="text-sand-500">— pick one or many</span>
              </span>
              <input
                type="file"
                name="photo"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                required
                className="text-sm text-sand-700 file:mr-4 file:rounded-full file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-cream"
              />
              <span className="text-xs text-sand-600">
                Up to {Math.round(IMAGE_MAX_BYTES / (1024 * 1024))}MB each.
                Upload the originals — nothing is re-compressed on the way in.
              </span>
            </label>
            <button className="w-fit rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
              upload
            </button>
          </form>
        </Card>

        {/* Details */}
        <Card>
          <h2 className="text-lg tracking-tight text-charcoal">Details</h2>

          {!canEdit ? (
            <p className="mt-4 text-sm text-sand-600">
              Only the owner can change prices and product details.
            </p>
          ) : (
            <form action={updateProduct} className="mt-4 grid gap-3">
              <input type="hidden" name="productId" value={product.id} />

              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-sand-600">Name</span>
                <input
                  name="name"
                  defaultValue={product.name}
                  className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-sand-600">Category</span>
                  <select
                    name="category"
                    defaultValue={product.category}
                    className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                    {!categories.some((c) => c.slug === product.category) && (
                      <option value={product.category}>
                        {product.category} (inactive)
                      </option>
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-sand-600">Price (Rs)</span>
                  <input
                    type="number"
                    name="price"
                    min={0}
                    defaultValue={product.price}
                    className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm tabular-nums"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-sand-600">Size</span>
                  <input
                    name="size"
                    defaultValue={product.size}
                    className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-sand-600">Tagline</span>
                  <input
                    name="tagline"
                    defaultValue={product.tagline}
                    className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-sand-600">Description</span>
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={product.description}
                  className="resize-none rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-sand-600">
                  Ingredients{" "}
                  <span className="text-sand-500">— comma separated</span>
                </span>
                <input
                  name="ingredients"
                  defaultValue={product.ingredients.join(", ")}
                  className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                />
                <span className="text-xs text-sand-600">
                  Shown as the chips under &ldquo;what&rsquo;s in it&rdquo;.
                </span>
              </label>

              {/*
                "The honest bit" on the product page. Rows are label/value
                pairs; clearing a label removes that row, and there are always
                three spare blanks so more can be added without JavaScript.
              */}
              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs text-sand-600">
                  The honest bit{" "}
                  <span className="text-sand-500">
                    — serving, sugar, shelf life, anything worth stating plainly
                  </span>
                </legend>
                {[...product.nutrition, ...Array(3).fill({ label: "", value: "" })].map(
                  (row, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        name={`nutrition-label-${i}`}
                        defaultValue={row.label}
                        placeholder="Added sugar"
                        aria-label={`Fact ${i + 1} label`}
                        className="w-2/5 rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                      />
                      <input
                        name={`nutrition-value-${i}`}
                        defaultValue={row.value}
                        placeholder="None"
                        aria-label={`Fact ${i + 1} value`}
                        className="flex-1 rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                      />
                    </div>
                  ),
                )}
                <span className="text-xs text-sand-600">
                  Clear a label to delete that row. Save to get three more
                  blanks.
                </span>
              </fieldset>

              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={product.featured}
                  className="h-4 w-4 accent-[var(--color-terracotta)]"
                />
                <span className="text-sm text-sand-700">
                  Feature on the homepage
                </span>
              </label>

              <button className="mt-1 w-fit rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                save changes
              </button>
            </form>
          )}

          {canEdit && (
            <div className="mt-6 border-t border-sand-200 pt-5">
              {product.archivedAt ? (
                <form action={restoreProduct}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button className="rounded-full bg-olive px-5 py-2.5 text-sm text-cream transition-colors hover:bg-olive-light">
                    restore product
                  </button>
                </form>
              ) : (
                <form action={archiveProduct}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button className="rounded-full border border-terracotta/40 px-5 py-2.5 text-sm text-terracotta-deep transition-colors hover:bg-terracotta/10">
                    archive product
                  </button>
                  <p className="mt-2 text-xs text-sand-600">
                    Archiving hides it from the shop. Past orders keep working —
                    nothing is ever deleted.
                  </p>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

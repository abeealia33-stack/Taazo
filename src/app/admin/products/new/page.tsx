import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading, Card } from "@/components/admin/ui";
import { createProduct } from "../../catalog-actions";

export const dynamic = "force-dynamic";

const ACCENTS = [
  { token: "var(--color-fruit-carrot)", label: "Carrot" },
  { token: "var(--color-fruit-mango)", label: "Mango" },
  { token: "var(--color-fruit-dragon)", label: "Dragonfruit" },
  { token: "var(--color-fruit-kiwi)", label: "Kiwi" },
  { token: "var(--color-fruit-melon)", label: "Melon" },
  { token: "var(--color-fruit-peach)", label: "Peach" },
  { token: "var(--color-gold)", label: "Gold" },
  { token: "var(--color-olive)", label: "Olive" },
];

export default async function NewProductPage() {
  await requireOwner();
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

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
          title="New product"
          subtitle="It appears on the shop as soon as you save. Add it to a batch to give it stock."
        />
      </div>

      <Card>
        <form
          action={createProduct}
          encType="multipart/form-data"
          className="grid gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">Name *</span>
              <input
                name="name"
                required
                placeholder="Watermelon Cooler"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">Category *</span>
              <select
                name="category"
                required
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">Price (Rs) *</span>
              <input
                type="number"
                name="price"
                min={0}
                required
                defaultValue={0}
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm tabular-nums"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">Size</span>
              <input
                name="size"
                placeholder="350 ml"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs text-sand-600">Tagline</span>
              <input
                name="tagline"
                placeholder="the summer one"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs text-sand-600">Description</span>
              <textarea
                name="description"
                rows={4}
                placeholder="What it is, where the fruit came from, why it tastes the way it does."
                className="resize-none rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs text-sand-600">
                Ingredients{" "}
                <span className="text-sand-500">— comma separated</span>
              </span>
              <input
                name="ingredients"
                placeholder="Watermelon, Lime, Mint"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-xs text-sand-600">
              Accent colour — used for the card glow and the product page
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCENTS.map((a, i) => (
                <label
                  key={a.token}
                  className="cursor-pointer rounded-lg border border-sand-300 px-3 py-2 transition-colors has-checked:border-charcoal has-checked:bg-sand-200"
                >
                  <input
                    type="radio"
                    name="accent"
                    value={a.token}
                    defaultChecked={i === 0}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-2 text-xs text-charcoal">
                    <span
                      aria-hidden
                      className="h-4 w-4 rounded-full"
                      style={{ background: a.token }}
                    />
                    {a.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">
              Photo — shown on the card and the product page
            </span>
            <input
              type="file"
              name="photo"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="text-sm text-sand-700 file:mr-4 file:rounded-full file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-cream"
            />
            <span className="text-xs text-sand-600">
              Shoot it square or 4:5 portrait. You can add more photos after saving.
            </span>
          </label>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              name="featured"
              className="h-4 w-4 accent-[var(--color-terracotta)]"
            />
            <span className="text-sm text-sand-700">Feature on the homepage</span>
          </label>

          <button className="mt-2 w-fit rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep">
            create product
          </button>
        </form>
      </Card>
    </>
  );
}

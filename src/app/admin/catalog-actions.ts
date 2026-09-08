"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireOwner, audit } from "@/lib/auth";
import { storage, validateUpload } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { unlink } from "fs/promises";
import path from "path";

/**
 * Catalogue management: categories, products, and product photography.
 *
 * Kept separate from actions.ts, which is about the daily order loop. These
 * are the "set the shop up" operations rather than the "run the day" ones.
 */

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/gifting");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
}

// ------------------------------------------------------------- categories

const CategorySchema = z.object({
  name: z.string().min(2, "Give the category a name"),
  slug: z.string().optional(),
  description: z.string().max(200).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createCategory(formData: FormData) {
  const session = await requireOwner();
  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return;

  const slug = slugify(parsed.data.slug || parsed.data.name);
  const clash = await db.category.findUnique({ where: { slug } });
  if (clash) return; // a category with that slug already exists

  const category = await db.category.create({
    data: {
      slug,
      name: parsed.data.name,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder,
      active: true,
    },
  });

  await audit(session, "Category", category.id, "created", slug);
  revalidateStorefront();
}

export async function updateCategory(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("categoryId") ?? "");
  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!id || !parsed.success) return;

  await db.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await audit(session, "Category", id, "updated");
  revalidateStorefront();
}

export async function toggleCategory(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("categoryId") ?? "");
  const category = await db.category.findUnique({ where: { id } });
  if (!category) return;

  await db.category.update({
    where: { id },
    data: { active: !category.active },
  });
  await audit(
    session,
    "Category",
    id,
    category.active ? "hidden" : "shown",
  );
  revalidateStorefront();
}

export async function deleteCategory(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("categoryId") ?? "");
  const category = await db.category.findUnique({ where: { id } });
  if (!category) return;

  // Refuse to orphan products. Hiding is almost always what was meant anyway.
  const inUse = await db.product.count({ where: { category: category.slug } });
  if (inUse > 0) return;

  await db.category.delete({ where: { id } });
  await audit(session, "Category", id, "deleted", category.slug);
  revalidateStorefront();
}

/**
 * Move a product into a category.
 *
 * A product always belongs to exactly one category, so "adding" it here is a
 * move: it leaves whichever category it was in. That is why the dropdown lists
 * every product with its current category shown alongside.
 */
export async function assignProductToCategory(formData: FormData) {
  const session = await requireOwner();
  const categoryId = String(formData.get("categoryId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!categoryId || !productId) return;

  const [category, product] = await Promise.all([
    db.category.findUnique({ where: { id: categoryId } }),
    db.product.findUnique({ where: { id: productId } }),
  ]);
  if (!category || !product) return;
  if (product.category === category.slug) return;

  await db.product.update({
    where: { id: productId },
    data: { category: category.slug },
  });

  await audit(
    session,
    "Product",
    productId,
    "moved category",
    `${product.category} → ${category.slug}`,
  );
  revalidateStorefront();
}

// --------------------------------------------------------------- products

const NewProductSchema = z.object({
  name: z.string().min(2, "Give the product a name"),
  tagline: z.string().max(120).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  size: z.string().max(40).optional(),
  price: z.coerce.number().int().min(0),
  accent: z.string().max(60).optional(),
  featured: z.coerce.boolean().optional(),
});

export async function createProduct(formData: FormData) {
  const session = await requireOwner();
  const parsed = NewProductSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    category: formData.get("category"),
    size: formData.get("size"),
    price: formData.get("price"),
    accent: formData.get("accent"),
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) return;

  const base = slugify(parsed.data.name);
  // Slugs are URLs, so a clash gets a suffix rather than an error.
  let slug = base;
  let n = 2;
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  const last = await db.product.findFirst({ orderBy: { sortOrder: "desc" } });

  const photos: string[] = [];
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const invalid = validateUpload(photo);
    if (!invalid) {
      const { url } = await storage.put(photo, "products");
      photos.push(url);
    }
  }

  const ingredients = String(formData.get("ingredients") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const product = await db.product.create({
    data: {
      slug,
      name: parsed.data.name,
      tagline: parsed.data.tagline || "",
      description: parsed.data.description || "",
      category: parsed.data.category,
      size: parsed.data.size || "",
      price: parsed.data.price,
      accent: parsed.data.accent || "var(--color-fruit-carrot)",
      ingredients,
      nutrition: [],
      photos,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      featured: Boolean(parsed.data.featured),
      active: true,
    },
  });

  await audit(session, "Product", product.id, "created", slug);
  revalidateStorefront();
  redirect(`/admin/products/${product.id}`);
}

export async function archiveProduct(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("productId") ?? "");
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return;

  // Never hard-delete: past orders reference this product and must keep working.
  await db.product.update({
    where: { id },
    data: { active: false, archivedAt: new Date() },
  });
  await audit(session, "Product", id, "archived", product.slug);
  revalidateStorefront();
  redirect("/admin/products");
}

export async function restoreProduct(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("productId") ?? "");
  await db.product.update({
    where: { id },
    data: { active: true, archivedAt: null },
  });
  await audit(session, "Product", id, "restored");
  revalidateStorefront();
}

export async function reorderProduct(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("productId") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return;

  const neighbour = await db.product.findFirst({
    where:
      direction === "up"
        ? { sortOrder: { lt: product.sortOrder } }
        : { sortOrder: { gt: product.sortOrder } },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await db.product.update({
    where: { id: product.id },
    data: { sortOrder: neighbour.sortOrder },
  });
  await db.product.update({
    where: { id: neighbour.id },
    data: { sortOrder: product.sortOrder },
  });

  await audit(session, "Product", id, `moved ${direction}`);
  revalidateStorefront();
}

// ----------------------------------------------------------------- photos

export async function uploadProductPhoto(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("productId") ?? "");
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) return;
  const invalid = validateUpload(file);
  if (invalid) return;

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return;

  const { url } = await storage.put(file, "products");
  await db.product.update({
    where: { id },
    data: { photos: [...product.photos, url] },
  });

  await audit(session, "Product", id, "photo uploaded");
  revalidateStorefront();
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/shop/${product.slug}`);
}

/**
 * Delete a locally stored upload once nothing references it.
 *
 * Without this, removing a photo only detached it from the product and left the
 * file on disk forever — a few megabytes each, accumulating every time someone
 * swapped an image. Blob-hosted files are left alone; the host owns those.
 */
async function deleteLocalUpload(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const stillUsed = await db.product.count({ where: { photos: { has: url } } });
  if (stillUsed > 0) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    // Already gone, or never written locally. Nothing to do.
  }
}

export async function removeProductPhoto(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "");

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return;

  await db.product.update({
    where: { id },
    data: { photos: product.photos.filter((p) => p !== url) },
  });

  await deleteLocalUpload(url);
  await audit(session, "Product", id, "photo removed");
  revalidateStorefront();
  revalidatePath(`/admin/products/${id}`);
}

/** The first photo is the one used on cards and as the product hero. */
export async function makePrimaryPhoto(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "");

  const product = await db.product.findUnique({ where: { id } });
  if (!product || !product.photos.includes(url)) return;

  await db.product.update({
    where: { id },
    data: { photos: [url, ...product.photos.filter((p) => p !== url)] },
  });

  await audit(session, "Product", id, "primary photo changed");
  revalidateStorefront();
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/shop/${product.slug}`);
}

export async function uploadCategoryPhoto(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("categoryId") ?? "");
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) return;
  if (validateUpload(file)) return;

  const { url } = await storage.put(file, "categories");
  await db.category.update({ where: { id }, data: { photo: url } });

  await audit(session, "Category", id, "photo uploaded");
  revalidateStorefront();
}

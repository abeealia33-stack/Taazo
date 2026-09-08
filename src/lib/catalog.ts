import { db } from "./db";
import type { Product as DbProduct, Category as DbCategory } from "@/generated/prisma";

/**
 * The catalogue, read from the database.
 *
 * NOTE ON FILTERING: visibility is decided by `active` alone, never by
 * `archivedAt: null`. Prisma's MongoDB connector treats "field set to null" and
 * "field absent" as different things, so a `archivedAt: null` filter silently
 * matches zero documents for any product created before that field existed.
 * Archiving sets `active: false` as well, so `active` is both sufficient and
 * safe.
 *
 * This is the single source of truth for everything the storefront shows.
 * `src/data/products.ts` is now only the seed input — editing a product in the
 * admin panel changes the site, which is the whole point of having an admin
 * panel.
 *
 * The shape below is what the UI components consume. Keeping a mapping layer
 * means the database schema can change without touching every component.
 */

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  size: string;
  price: number;
  accent: string;
  ingredients: string[];
  nutrition: { label: string; value: string }[];
  /** Primary image, or null while no photo has been uploaded. */
  photo: string | null;
  photos: string[];
  featured: boolean;
  sortOrder: number;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  photo: string | null;
  sortOrder: number;
};

function toCatalog(p: DbProduct): CatalogProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    category: p.category,
    size: p.size,
    price: p.price,
    accent: p.accent,
    ingredients: p.ingredients,
    nutrition: p.nutrition.map((n) => ({ label: n.label, value: n.value })),
    photo: p.photos[0] ?? null,
    photos: p.photos,
    featured: p.featured,
    sortOrder: p.sortOrder,
  };
}

function toCategory(c: DbCategory): CatalogCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    photo: c.photo,
    sortOrder: c.sortOrder,
  };
}

export async function getProducts(categorySlug?: string) {
  const products = await db.product.findMany({
    where: {
      active: true,
      ...(categorySlug && categorySlug !== "all" ? { category: categorySlug } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
  return products.map(toCatalog);
}

export async function getFeaturedProducts(limit = 3) {
  const products = await db.product.findMany({
    where: { active: true, featured: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
  return products.map(toCatalog);
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({ where: { slug } });
  if (!product || !product.active || product.archivedAt) return null;
  return toCatalog(product);
}

/**
 * Siblings first, then anything else pressed today.
 *
 * Same-category alone leaves single-product categories with an empty rail —
 * with one juice and one tea in the catalogue, those two pages cross-sold
 * nothing at all and dead-ended into the footer.
 */
export async function getRelatedProducts(product: CatalogProduct, limit = 3) {
  const sameCategory = await db.product.findMany({
    where: {
      active: true,
      category: product.category,
      slug: { not: product.slug },
    },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });

  if (sameCategory.length >= limit) return sameCategory.map(toCatalog);

  const fill = await db.product.findMany({
    where: {
      active: true,
      category: { not: product.category },
      slug: { not: product.slug },
    },
    orderBy: { sortOrder: "asc" },
    take: limit - sameCategory.length,
  });

  return [...sameCategory, ...fill].map(toCatalog);
}

export async function getCategories() {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return categories.map(toCategory);
}

/** Every product slug, for generateStaticParams and the sitemap. */
export async function getAllProductSlugs() {
  const products = await db.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}

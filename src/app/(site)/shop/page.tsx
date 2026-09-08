import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { getAvailability } from "@/lib/liveBatch";
import { getProducts, getCategories } from "@/lib/catalog";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Cold-pressed juice, fresh fruit jars and iced tea, pressed each morning in Lahore and delivered the same day.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category ?? "all";

  const [products, categories, availability] = await Promise.all([
    getProducts(active),
    getCategories(),
    getAvailability(),
  ]);

  // Filters are whatever categories exist in the admin panel, not a hardcoded list.
  const filters = [
    { value: "all", label: "Everything" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="the shop"
        title="Today's batch"
        intro="Everything here was cut and pressed this morning. What sells out is gone until tomorrow — we would rather run out than press yesterday's fruit."
      />

      <div className="container-taazo">
        <nav
          aria-label="Filter by category"
          className="flex flex-wrap gap-2 border-b border-sand-300/70 pb-8"
        >
          {filters.map((f) => {
            const isActive = active === f.value;
            return (
              <Link
                key={f.value}
                href={f.value === "all" ? "/shop" : `/shop?category=${f.value}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors duration-[var(--dur-fast)]",
                  isActive
                    ? "bg-charcoal text-cream"
                    : "bg-sand-200/70 text-charcoal/75 hover:bg-sand-300/70 hover:text-charcoal",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        {products.length === 0 ? (
          <ComingSoon
            title="Nothing in this one yet"
            body="This part of the range is still being built. Everything we are pressing today is one tap away."
            whatsappMessage="Hi taazo! When is this coming?"
          />
        ) : (
          /* Editorial asymmetry: every third card runs tall and drops down. */
          <Reveal
            stagger
            className="grid gap-x-8 gap-y-16 py-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product, i) => (
              <ProductCard
                key={product.slug}
                product={product}
                available={availability.get(product.slug)}
                tall={i % 3 === 1}
                priority={i < 3}
                className={i % 3 === 1 ? "lg:mt-14" : undefined}
              />
            ))}
          </Reveal>
        )}
      </div>
    </>
  );
}

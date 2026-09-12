import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
  getCategories,
} from "@/lib/catalog";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCart } from "@/components/cart/AddToCart";
import { StickyBuyBar } from "@/components/cart/StickyBuyBar";
import { buyBoxAnchor } from "@/components/cart/buyBox";
import { Reveal } from "@/components/motion/Reveal";
import { formatPKR } from "@/lib/utils";
import { isBeforeCutoff } from "@/lib/batch";
import { getLiveBatch, getAvailability } from "@/lib/liveBatch";
import { SITE } from "@/lib/site";
import { getDeliverySummary } from "@/lib/orders";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { title: `${product.name} · taazo.`, description: product.tagline },
  };
}

export const revalidate = 300;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [batch, availability, related, categories, delivery] = await Promise.all([
    getLiveBatch(),
    getAvailability(),
    getRelatedProducts(product, 3),
    getCategories(),
    getDeliverySummary(),
  ]);
  const available = availability.get(product.slug);
  const sameDay = batch.isLive && isBeforeCutoff(SITE.sameDayCutoffHour);
  const categoryName =
    categories.find((c) => c.slug === product.category)?.name ?? product.category;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: categoryName,
    brand: { "@type": "Brand", name: "taazo." },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability:
        available === 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-taazo pt-8 md:pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-sand-600">
          <Link href="/shop" className="transition-colors hover:text-terracotta">
            shop
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-charcoal">{product.name}</span>
        </nav>
      </div>

      {/*
        Explicit placement rather than source order: on mobile the name and
        price come before the image, so the first screen answers "what is this
        and what does it cost" instead of showing only a photograph. Desktop is
        unchanged — image left and sticky, everything else right.
      */}
      <article className="container-taazo grid gap-x-20 gap-y-8 pb-24 pt-10 lg:grid-cols-2">
        <div className="lg:col-start-2 lg:row-start-1">
          <p className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            {categoryName}
          </p>
          <h1 className="display-tight mt-4 text-4xl text-charcoal md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-sand-700">{product.tagline}</p>

          <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-3">
            <span className="text-3xl tabular-nums text-charcoal">
              {formatPKR(product.price)}
            </span>
            <span className="text-sm text-sand-600">{product.size}</span>

            {/*
              The strongest thing this page can say is that the bottle was
              pressed hours ago, and it is the one claim a shelf-stable
              competitor cannot make. It was previously the third bullet of a
              grey box below the fold.
            */}
            {batch.isLive && (
              <span className="inline-flex items-center gap-2 rounded-full bg-sand-200/80 px-3 py-1.5 text-sm text-charcoal">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-terracotta"
                />
                pressed {batch.pressedAtLabel} today
              </span>
            )}
          </div>
        </div>

        {/* Sticky image column — the photograph stays with you while you read. */}
        <div className="lg:sticky lg:top-28 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
          <ProductGallery
            photos={product.photos}
            name={product.name}
            accent={product.accent}
          />
        </div>

        <div className="lg:col-start-2 lg:row-start-2">
          <p className="max-w-lg text-base leading-relaxed text-sand-800">
            {product.description}
          </p>

          <div className="mt-9" {...buyBoxAnchor}>
            <AddToCart product={product} available={available} />
          </div>

          {/* Delivery terms shown before checkout — the top abandonment cause. */}
          <div className="mt-8 rounded-xl bg-sand-100 p-5 ring-1 ring-sand-200">
            <ul className="flex flex-col gap-2.5 text-sm text-sand-700">
              <li className="flex gap-2.5">
                <span aria-hidden className="text-terracotta">
                  ·
                </span>
                <span>
                  <span className="text-charcoal">
                    {sameDay
                      ? `Order before ${SITE.sameDayCutoffHour % 12 || 12}pm for delivery today.`
                      : "Ordering now for tomorrow morning."}
                  </span>{" "}
                  {batch.isLive
                    ? `Batch ${batch.code}.`
                    : "Tomorrow's batch is pressed at dawn."}
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="text-terracotta">
                  ·
                </span>
                <span>
                  Delivery across {SITE.city} from {formatPKR(delivery.from)}
                  {delivery.freeOver > 0 && (
                    <>, free over {formatPKR(delivery.freeOver)}</>
                  )}
                  .
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="text-terracotta">
                  ·
                </span>
                <span>Cash on delivery, or bank transfer.</span>
              </li>
            </ul>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-2xs uppercase tracking-[0.18em] text-sand-500">
                what&rsquo;s in it
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="rounded-full bg-sand-200/80 px-3 py-1.5 text-sm text-charcoal"
                  >
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* The honesty panel — specificity as differentiation. */}
            <div>
              <h2 className="text-2xs uppercase tracking-[0.18em] text-sand-500">
                the honest bit
              </h2>
              <dl className="mt-4 flex flex-col gap-2.5 text-sm">
                {product.nutrition.map((n) => (
                  <div
                    key={n.label}
                    className="flex justify-between gap-4 border-b border-sand-300/60 pb-2"
                  >
                    <dt className="text-sand-600">{n.label}</dt>
                    <dd className="text-right text-charcoal">{n.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-taazo border-t border-sand-300/70 py-20">
          <h2 className="display-tight text-2xl text-charcoal md:text-3xl">
            Also pressed today
          </h2>
          <Reveal stagger className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Reveal>
        </section>
      )}

      <StickyBuyBar product={product} available={available} />
    </>
  );
}

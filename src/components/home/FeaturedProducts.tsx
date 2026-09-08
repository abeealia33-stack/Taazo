import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAvailability } from "@/lib/liveBatch";
import { getFeaturedProducts } from "@/lib/catalog";

export async function FeaturedProducts() {
  const [featured, availability] = await Promise.all([
    getFeaturedProducts(3),
    getAvailability(),
  ]);

  if (featured.length === 0) return null;

  return (
    <section className="pt-14 md:pt-20" id="whats-fresh">
      <div className="container-taazo">
        <SectionHeading
          eyebrow="what's fresh"
          title="Made this morning, gone by tomorrow"
          action={{ href: "/shop", label: "see everything" }}
        />

        {/* Editorial rhythm: the middle card sits lower and taller. */}
        <Reveal
          stagger
          className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featured.map((product, i) => (
            <ProductCard
              key={product.slug}
              product={product}
              available={availability.get(product.slug)}
              tall={i === 1}
              className={i === 1 ? "lg:mt-16" : undefined}
            />
          ))}
        </Reveal>

        <p className="mt-14 text-center text-sm text-sand-600">
          Every bottle carries the batch it came from.{" "}
          <Link
            href="/story"
            className="text-terracotta underline-offset-4 hover:underline"
          >
            How we press
          </Link>
        </p>
      </div>
    </section>
  );
}

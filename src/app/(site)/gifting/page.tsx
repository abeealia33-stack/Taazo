import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { GiftBoxBuilder } from "@/components/gifting/GiftBoxBuilder";
import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProducts } from "@/lib/catalog";
import { getGiftTiers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gifting boxes",
  description:
    "Build a gift box of cold-pressed juice and fresh fruit jars, packed on ice with a handwritten card. For Eid, weddings and corporate gifting in Lahore.",
};

const OCCASIONS = [
  {
    title: "Eid",
    body: "An alternative to the fourth box of mithai. Arrives cold, gets finished the same day.",
  },
  {
    title: "Weddings",
    body: "Mayun mornings, mehndi afternoons, and thank-you boxes for the people who did the work.",
  },
  {
    title: "The office",
    body: "Standing weekly orders for pantries, and bulk boxes for clients who already have enough diaries.",
  },
];

export const revalidate = 60;

export default async function GiftingPage() {
  const [products, tiers] = await Promise.all([
    getProducts(),
    getGiftTiers(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="gifting"
        title="Send a box that arrives cold"
        intro="Choose the size, fill it with what you actually want in it, and write the card. We pack it on ice the morning it goes out."
      />

      <section className="container-taazo pb-24">
        <GiftBoxBuilder products={products} tiers={tiers} />
      </section>

      <section className="bg-sand-100 py-24">
        <div className="container-taazo">
          <SectionHeading
            eyebrow="when people send them"
            title="The occasions this was built for"
          />
          <Reveal stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {OCCASIONS.map((o) => (
              <div
                key={o.title}
                className="rounded-xl bg-cream p-7 ring-1 ring-sand-200"
              >
                <h3 className="text-xl tracking-tight text-charcoal">
                  {o.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-sand-700">
                  {o.body}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="container-taazo py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <ProductImage
              photo={null}
              name="Six bottles packed on ice"
              accent="var(--color-gold)"
              ratio="square"
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="rounded-2xl shadow-lg"
            />
          </Reveal>
          <Reveal>
            <h2 className="display-tight text-3xl text-charcoal md:text-4xl">
              Ordering more than twelve?
            </h2>
            <p className="mt-5 max-w-lg text-lg text-sand-700">
              Weddings, corporate gifting and office pantries are handled
              separately, with pricing that reflects the volume and a delivery
              plan that reflects the date. Tell us the headcount and the day.
            </p>
            <ButtonLink href="/corporate" size="lg" className="mt-8">
              corporate &amp; bulk enquiry
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}

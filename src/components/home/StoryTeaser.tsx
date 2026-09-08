import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { ProductImage } from "@/components/product/ProductImage";

const SEASONS = [
  { months: "Dec – Mar", fruit: "Kinnow, carrot, beetroot" },
  { months: "Apr – Jun", fruit: "Mango, falsa, watermelon" },
  { months: "Jul – Sep", fruit: "Peach, plum, pineapple" },
  { months: "Oct – Nov", fruit: "Guava, pomegranate, apple" },
];

export function StoryTeaser() {
  return (
    <section className="container-taazo py-8">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal>
          <p className="text-2xs uppercase tracking-[0.2em] text-sand-500">
            seasonality
          </p>
          <h2 className="display-tight mt-4 text-3xl text-charcoal md:text-4xl">
            We only make what Punjab is actually growing
          </h2>
          <p className="mt-5 max-w-lg text-lg text-sand-700">
            Which means the menu changes four times a year, and some of your
            favourites disappear for months. That is not a limitation we are
            apologising for — it is the reason the fruit tastes the way it does.
          </p>

          <dl className="mt-9 grid gap-px overflow-hidden rounded-lg bg-sand-300 sm:grid-cols-2">
            {SEASONS.map((s) => (
              <div key={s.months} className="bg-cream px-5 py-4">
                <dt className="text-2xs uppercase tracking-[0.14em] text-terracotta">
                  {s.months}
                </dt>
                <dd className="mt-1.5 text-sm text-charcoal">{s.fruit}</dd>
              </div>
            ))}
          </dl>

          <ButtonLink href="/story" variant="secondary" className="mt-9">
            read our story
          </ButtonLink>
        </Reveal>

        <Reveal className="lg:order-first">
          <ProductImage
            photo={null}
            name="The orchard"
            accent="var(--color-fruit-kiwi)"
            ratio="wide"
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="rounded-2xl shadow-md"
          />
        </Reveal>
      </div>
    </section>
  );
}

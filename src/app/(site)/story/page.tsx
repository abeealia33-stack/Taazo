import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { getStoryChapters } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Where taazo's fruit comes from, how it is pressed, and why the menu changes with the season.",
};

export const revalidate = 60;

export default async function StoryPage() {
  const chapters = await getStoryChapters();

  return (
    <>
      <PageHeader
        eyebrow="our story"
        title="Fruit, pressed the same morning you drink it"
        intro="taazo started because fresh juice in Pakistan had come to mean a carton with a long shelf life. We wanted the short one."
      />

      {chapters.length > 0 && (
        <div className="container-taazo flex flex-col gap-24 pb-24 md:gap-32">
          {chapters.map((chapter, i) => (
            <Reveal
              key={chapter.id}
              className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-last" : ""
              }`}
            >
              <div>
                <p className="text-2xs uppercase tracking-[0.2em] text-sand-500">
                  {chapter.eyebrow}
                </p>
                <h2 className="display-tight mt-4 text-3xl text-charcoal md:text-4xl">
                  {chapter.title}
                </h2>
                {chapter.body.map((para) => (
                  <p
                    key={para.slice(0, 24)}
                    className="mt-5 max-w-lg text-base leading-relaxed text-sand-800"
                  >
                    {para}
                  </p>
                ))}
              </div>
              <ProductImage
                photo={chapter.photo}
                name={chapter.title}
                accent={chapter.accent}
                ratio="wide"
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="rounded-2xl shadow-md"
              />
            </Reveal>
          ))}
        </div>
      )}

      <section className="bg-olive py-24">
        <div className="container-narrow text-center">
          <h2 className="display-tight text-3xl text-cream md:text-4xl">
            Today&rsquo;s batch is already pressed
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-cream/70">
            It will not be here tomorrow. That is the whole point.
          </p>
          <ButtonLink href="/shop" size="lg" className="mt-9">
            see what&rsquo;s fresh
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

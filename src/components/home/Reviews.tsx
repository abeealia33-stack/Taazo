import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getTestimonials } from "@/lib/content";

export async function Reviews() {
  const REVIEWS = await getTestimonials();
  if (REVIEWS.length === 0) return null;

  return (
    <section className="container-taazo pt-16 md:pt-24">
      <SectionHeading
        eyebrow="from the orders"
        title="What people actually say"
        align="center"
      />

      <Reveal stagger className="mt-14 grid gap-6 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure
            key={r.name}
            className="relative flex flex-col justify-between rounded-xl bg-sand-100 p-7 ring-1 ring-sand-200"
          >
            <span
              aria-hidden
              className="absolute left-7 top-0 h-1 w-12 rounded-b-full"
              style={{ background: r.accent }}
            />
            <blockquote className="text-base leading-relaxed text-charcoal">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 text-sm text-sand-600">
              {r.name} · {r.city}
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}

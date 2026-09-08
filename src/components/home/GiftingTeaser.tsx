import { getGiftTiers } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ProductImage } from "@/components/product/ProductImage";
import { formatPKR } from "@/lib/utils";

/**
 * The gifting section — the brand's actual differentiator.
 *
 * The deep-olive ground is the one place the site leaves cream, which is what
 * makes it read as a distinct offer rather than another product row.
 */
export async function GiftingTeaser() {
  const tiers = await getGiftTiers();
  if (tiers.length === 0) return null;

  return (
    <section
      id="gifting"
      className="mt-20 bg-olive py-20 md:mt-28 md:py-24"
    >
      <div className="container-taazo">
        <SectionHeading
          tone="inverse"
          eyebrow="gifting"
          title="Send a box that arrives cold"
          intro="Packed on ice the morning it goes out, with a handwritten card. For Eid, for weddings, for the office — and for the days when flowers would have been the boring answer."
          action={{ href: "/gifting", label: "build a box" }}
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <ProductImage
              photo={null}
              name="Six bottles packed on ice"
              accent="var(--color-gold)"
              ratio="square"
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="rounded-2xl shadow-xl"
            />
          </Reveal>

          <Reveal stagger className="flex flex-col gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.slug}
                className="flex items-center justify-between gap-6 rounded-xl border border-cream/15 bg-cream/[0.06] p-6 transition-colors duration-[var(--dur-base)] hover:bg-cream/[0.11]"
              >
                <div>
                  <h3 className="text-xl tracking-tight text-cream">
                    {tier.name}
                  </h3>
                  <p className="mt-1.5 max-w-sm text-sm text-cream/65">
                    {tier.blurb}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg tabular-nums text-gold">
                    {formatPKR(tier.price)}
                  </p>
                  <p className="text-2xs uppercase tracking-[0.14em] text-cream/50">
                    {tier.bottles} bottles
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/gifting" size="lg" variant="primary">
                build your box
              </ButtonLink>
              <ButtonLink
                href="/corporate"
                size="lg"
                variant="ghost"
                className="text-cream hover:bg-cream/10"
              >
                corporate &amp; bulk
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

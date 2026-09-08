import type { Metadata } from "next";
import { Wordmark, Monogram } from "@/components/brand/Wordmark";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductImage } from "@/components/product/ProductImage";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const CORE = [
  { name: "Terracotta", token: "--color-terracotta", hex: "#C4602F", use: "brand, CTAs, wordmark" },
  { name: "Deep olive", token: "--color-olive", hex: "#2F3A22", use: "contrast sections" },
  { name: "Gold", token: "--color-gold", hex: "#D9A441", use: "accents, prices on olive" },
  { name: "Cream", token: "--color-cream", hex: "#F6EFE3", use: "the constant ground" },
  { name: "Charcoal", token: "--color-charcoal", hex: "#2B2117", use: "all text, never pure black" },
];

const SAND = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const FRUIT = [
  { name: "Dragonfruit", token: "--color-fruit-dragon" },
  { name: "Mango", token: "--color-fruit-mango" },
  { name: "Kiwi", token: "--color-fruit-kiwi" },
  { name: "Melon", token: "--color-fruit-melon" },
  { name: "Carrot", token: "--color-fruit-carrot" },
  { name: "Peach", token: "--color-fruit-peach" },
];

const TYPE = [
  { cls: "text-6xl display-tight", label: "6xl · hero" },
  { cls: "text-4xl display-tight", label: "4xl · page title" },
  { cls: "text-3xl display-tight", label: "3xl · section title" },
  { cls: "text-xl", label: "xl · card title" },
  { cls: "text-lg", label: "lg · intro" },
  { cls: "text-base", label: "base · body" },
  { cls: "text-sm", label: "sm · secondary" },
  { cls: "text-2xs uppercase tracking-[0.2em]", label: "2xs · eyebrow" },
];

/**
 * Internal design-system reference. Not linked from the site and excluded from
 * search engines — it exists so every new page stays in the same system.
 */
export default function StylePage() {
  return (
    <>
      <PageHeader
        eyebrow="internal"
        title="Design system"
        intro="Every token, type step and component state in one place. If something you need is not here, add it here first."
      />

      <div className="container-taazo flex flex-col gap-20 pb-32">
        <Section title="Wordmark">
          <div className="flex flex-wrap items-end gap-10 rounded-xl bg-sand-100 p-8">
            <Wordmark className="h-14 w-auto text-terracotta" />
            <Wordmark className="h-8 w-auto text-charcoal" />
            <div className="rounded-lg bg-olive p-6">
              <Wordmark className="h-8 w-auto text-cream" />
            </div>
            <Monogram className="h-14 w-14 rounded-xl" />
          </div>
          <p className="mt-4 max-w-2xl text-sm text-sand-600">
            Drawn as SVG paths, never set in a live font. Colour is inherited
            through <code className="text-charcoal">currentColor</code>, so it
            works on any ground. The serif wordmark on the older fruit-jar
            labels is retired and must not be used.
          </p>
        </Section>

        <Section title="Core palette">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CORE.map((c) => (
              <div key={c.name}>
                <div
                  className="h-24 rounded-lg ring-1 ring-sand-300/60"
                  style={{ background: `var(${c.token})` }}
                />
                <p className="mt-3 text-base text-charcoal">{c.name}</p>
                <p className="text-xs tabular-nums text-sand-600">{c.hex}</p>
                <p className="mt-1 text-xs text-sand-500">{c.use}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Warm neutral ramp">
          <div className="flex flex-wrap gap-2">
            {SAND.map((step) => (
              <div key={step} className="w-20">
                <div
                  className="h-16 rounded-md ring-1 ring-sand-300/60"
                  style={{ background: `var(--color-sand-${step})` }}
                />
                <p className="mt-2 text-xs tabular-nums text-sand-600">
                  sand-{step}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Product accents">
          <p className="mb-5 max-w-2xl text-sm text-sand-600">
            Sampled from each product&rsquo;s own photograph. Used for the card
            glow, the cart line marker and the product page — variety inside a
            fixed cream-and-terracotta frame.
          </p>
          <div className="flex flex-wrap gap-3">
            {FRUIT.map((f) => (
              <div key={f.name} className="w-28">
                <div
                  className="h-16 rounded-md"
                  style={{ background: `var(${f.token})` }}
                />
                <p className="mt-2 text-xs text-sand-600">{f.name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Type scale">
          <div className="flex flex-col gap-5">
            {TYPE.map((t) => (
              <div
                key={t.label}
                className="flex flex-col gap-1 border-b border-sand-300/60 pb-4 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="w-40 shrink-0 text-xs text-sand-500">
                  {t.label}
                </span>
                <span className={t.cls}>Pressed this morning</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button>primary</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="olive">olive</Button>
            <Button variant="ghost">ghost</Button>
            <Button disabled>disabled</Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <ButtonLink href="/style" size="sm">
              small
            </ButtonLink>
            <ButtonLink href="/style" size="md">
              medium
            </ButtonLink>
            <ButtonLink href="/style" size="lg">
              large
            </ButtonLink>
          </div>
        </Section>

        <Section title="Elevation">
          <div className="flex flex-wrap gap-6">
            {["xs", "sm", "md", "lg", "xl"].map((s) => (
              <div
                key={s}
                className="grid h-24 w-32 place-items-center rounded-lg bg-cream text-xs text-sand-600"
                style={{ boxShadow: `var(--shadow-${s})` }}
              >
                shadow-{s}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Motion">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["--dur-instant", "120ms", "state flips, checkboxes"],
              ["--dur-fast", "220ms", "hover, button press"],
              ["--dur-base", "380ms", "menus, colour washes"],
              ["--dur-slow", "640ms", "scroll reveals, drawers"],
              ["--dur-reveal", "900ms", "hero lines, entry"],
              ["--ease-out-soft", "cubic-bezier(.22,1,.36,1)", "the default"],
            ].map(([token, value, use]) => (
              <div
                key={token}
                className="rounded-lg bg-sand-100 p-4 ring-1 ring-sand-200"
              >
                <dt className="text-sm text-charcoal">{token}</dt>
                <dd className="mt-1 text-xs tabular-nums text-sand-600">
                  {value}
                </dd>
                <dd className="mt-1 text-xs text-sand-500">{use}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 max-w-2xl text-sm text-sand-600">
            Every animation collapses to a fade under{" "}
            <code className="text-charcoal">prefers-reduced-motion</code>. GSAP
            and Lenis are loaded on demand, never in the initial bundle, and
            Lenis is disabled entirely on touch devices.
          </p>
        </Section>

        <Section title="Photo slots">
          <p className="mb-5 max-w-2xl text-sm text-sand-600">
            Aspect ratios are locked so real photography drops in with no layout
            change. Until then, placeholders render in the product&rsquo;s own
            accent colour rather than as grey boxes.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(["hero", "product", "square", "wide"] as const).map((ratio) => (
              <div key={ratio}>
                <ProductImage
                  photo={null}
                  name={ratio}
                  accent="var(--color-fruit-carrot)"
                  ratio={ratio}
                />
                <p className="mt-2 text-xs text-sand-600">{ratio}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="display-tight mb-8 border-b border-sand-300/70 pb-4 text-2xl text-charcoal">
        {title}
      </h2>
      {children}
    </section>
  );
}

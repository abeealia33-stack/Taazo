import Image from "next/image";
import { cn } from "@/lib/utils";

type Ratio = "hero" | "product" | "square" | "wide";

const RATIOS: Record<Ratio, string> = {
  hero: "aspect-[3/2]",
  product: "aspect-[4/5]",
  square: "aspect-square",
  wide: "aspect-[16/9]",
};

type Props = {
  /** Real photo path under /public. Null renders the designed placeholder. */
  photo: string | null;
  name: string;
  accent: string;
  ratio?: Ratio;
  className?: string;
  /** Set on the LCP image only. */
  priority?: boolean;
  sizes?: string;
  /**
   * Re-encode quality. Next defaults to 75, which softens fruit texture
   * noticeably. 90 is the house default; the hero uses 95. Allowed values are
   * declared in next.config.ts.
   */
  quality?: 75 | 90 | 95;
  /**
   * Second photograph, cross-faded in when the enclosing `group` is hovered.
   * Ignored on touch devices, which have no hover — they get the primary shot.
   */
  hoverPhoto?: string | null;
};

/**
 * The single place a product photograph enters the UI.
 *
 * While real photography is missing, this renders a designed placeholder in
 * the product's own accent colour rather than a grey box — the page still
 * looks like the finished article. Aspect ratios are locked to the final
 * spec, so dropping real photos in causes no layout change anywhere.
 */
export function ProductImage({
  photo,
  name,
  accent,
  ratio = "product",
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 40vw",
  quality = 90,
  hoverPhoto = null,
}: Props) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-sand-200",
        RATIOS[ratio],
        className,
      )}
      style={{ ["--accent" as string]: accent }}
    >
      {photo ? (
        <>
          <Image
            src={photo}
            alt={name}
            fill
            priority={priority}
            sizes={sizes}
            quality={quality}
            className={cn(
              "object-cover",
              hoverPhoto &&
                "transition-opacity duration-[var(--dur-base)] ease-(--ease-out-soft) group-hover:opacity-0",
            )}
          />
          {hoverPhoto && (
            <Image
              src={hoverPhoto}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              quality={quality}
              className="object-cover opacity-0 transition-opacity duration-[var(--dur-base)] ease-(--ease-out-soft) group-hover:opacity-100 motion-reduce:hidden"
            />
          )}
        </>
      ) : (
        <Placeholder name={name} />
      )}
    </div>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 8%, color-mix(in oklab, var(--accent) 42%, var(--color-cream)) 0%, var(--color-cream) 72%)",
      }}
      role="img"
      aria-label={`${name} — photograph coming soon`}
    >
      <BottleGlyph />
      <span className="absolute bottom-4 left-0 right-0 px-4 text-center text-2xs uppercase tracking-[0.16em] text-sand-600">
        {name}
      </span>
    </div>
  );
}

function BottleGlyph() {
  return (
    <svg
      viewBox="0 0 120 200"
      className="h-[62%] w-auto opacity-90"
      aria-hidden
      fill="none"
    >
      <path
        d="M48 8h24v22c0 8 4 12 10 18 8 8 12 16 12 28v104c0 7-5 12-12 12H38c-7 0-12-5-12-12V76c0-12 4-20 12-28 6-6 10-10 10-18V8Z"
        fill="color-mix(in oklab, var(--accent) 78%, white)"
        stroke="color-mix(in oklab, var(--accent) 60%, var(--color-charcoal))"
        strokeWidth={3}
      />
      {/* the label band */}
      <rect
        x={26}
        y={104}
        width={68}
        height={46}
        fill="var(--color-cream)"
        opacity={0.94}
      />
      {/* the cap */}
      <rect x={44} y={2} width={32} height={12} rx={3} fill="var(--color-cream)" />
    </svg>
  );
}

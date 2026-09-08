import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { getLiveBatch } from "@/lib/liveBatch";
import { getFeaturedProducts } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { getHeroMedia } from "@/lib/media";

/**
 * Full-bleed hero.
 *
 * The photography is the strongest thing this brand owns, so it gets the whole
 * viewport rather than half of it, and the type sits on top of it.
 *
 * Three decisions keep that readable rather than turning it into soup:
 *
 *  - a DIRECTIONAL scrim, not a flat wash. Darkening the whole image would
 *    mute the fruit, which is the entire point of the picture. The gradient is
 *    heavy at the bottom-left where the type lives and clears over the
 *    top-right, so the food stays bright.
 *  - the headline is real text, never baked into the image, so it stays
 *    selectable, translatable and crisp at any pixel density.
 *  - the reveal is CSS-only. The largest contentful paint here is the
 *    photograph, and it must not wait on an animation library.
 */
export async function Hero() {
  const batch = await getLiveBatch();
  const [heroProduct] = await getFeaturedProducts(1);
  const heroMedia = await getHeroMedia();

  /**
   * Three-step fallback so the hero is never empty:
   *   1. whatever was uploaded in admin — image or video
   *   2. the featured product's photograph
   *   3. a designed brand gradient
   */
  const photo = heroMedia?.type === "image" ? heroMedia.url : heroProduct?.photo ?? null;
  const video = heroMedia?.type === "video" ? heroMedia : null;

  return (
    <section
      className="relative isolate flex min-h-[86svh] items-end overflow-hidden md:min-h-[90svh]"
      /**
       * The header is sticky, so it sits in normal flow and would otherwise
       * push the hero down — leaving a cream band above the photograph and the
       * inverted (cream) header text stranded on a cream background. Pulling
       * the hero up by exactly the header's height lets the image run to the
       * top of the viewport with the header floating over it. The top padding
       * below keeps the type clear of the header.
       *
       * The whole block must fit inside one viewport without scrolling, which
       * is why the headline is sized against min(vw, vh) rather than vw alone:
       * on a wide-but-short laptop, width-only sizing produced a 104px line
       * and pushed the buttons below the fold.
       */
      style={{ marginTop: "calc(var(--header-h) * -1)" }}
    >
      {/* The photograph, or a designed ground while none exists. */}
      <div className="absolute inset-0 -z-20">
        {video ? (
          /*
            Muted + autoplay + playsInline is the only combination browsers
            allow to start on its own. The poster carries the first paint, so a
            slow connection sees the still rather than a black rectangle, and
            preload="metadata" keeps the video off the critical path.
          */
          <video
            src={video.url}
            poster={video.posterUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            aria-label="taazo"
          />
        ) : photo ? (
          <Image
            src={photo}
            alt={heroProduct?.name ?? "taazo"}
            fill
            priority
            sizes="100vw"
            quality={95}
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(120% 100% at 78% 18%, var(--color-fruit-carrot) 0%, transparent 55%)," +
                "radial-gradient(90% 80% at 15% 85%, var(--color-terracotta) 0%, transparent 60%)," +
                "linear-gradient(150deg, var(--color-olive) 0%, var(--color-charcoal) 70%)",
            }}
            role="img"
            aria-label="taazo — photography coming soon"
          />
        )}
      </div>

      {/* Directional scrim: heavy under the type, clear over the fruit. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(43,33,23,0.88) 0%, rgba(43,33,23,0.62) 28%, rgba(43,33,23,0.18) 58%, rgba(43,33,23,0.06) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(43,33,23,0.55) 0%, rgba(43,33,23,0.15) 45%, transparent 70%)",
        }}
      />
      {/*
        A short scrim behind the header band. The main gradient is almost clear
        at the top — which is what keeps the fruit bright — but the header sits
        up there in cream, and over a high-key photograph it would lose
        contrast. This darkens only the top ~22% and fades out well above the
        headline.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[22%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(43,33,23,0.5) 0%, rgba(43,33,23,0.22) 55%, transparent 100%)",
        }}
      />

      <div className="container-taazo relative w-full pb-12 pt-28 md:pb-16 md:pt-32">
        <div className="max-w-3xl">
          <p
            className="hero-fade text-2xs uppercase tracking-[0.22em] text-cream/70"
            style={{ animationDelay: "80ms" }}
          >
            {SITE.city} · cold-pressed · same-day delivery
          </p>

          <h1 className="display-tight mt-5 text-[clamp(2.4rem,min(7.5vw,9.5vh),5.25rem)] leading-[0.95] text-cream">
            <span className="block overflow-hidden pb-1">
              <span className="hero-line block" style={{ animationDelay: "160ms" }}>
                Pressed this
              </span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="hero-line block" style={{ animationDelay: "270ms" }}>
                morning.
              </span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span
                className="hero-line block text-gold"
                style={{ animationDelay: "380ms" }}
              >
                Bottled by noon.
              </span>
            </span>
          </h1>

          <p
            className="hero-fade mt-5 max-w-md text-base text-cream/80 md:mt-6 md:text-lg"
            style={{ animationDelay: "520ms" }}
          >
            Fruit cut and pressed at dawn in {SITE.city}, delivered before it has
            a chance to stop being fresh. No concentrate, no added sugar.
          </p>

          {batch.note && (
            <p
              className="hero-fade mt-4 max-w-lg text-sm italic text-cream/65"
              style={{ animationDelay: "640ms" }}
            >
              &ldquo;{batch.note}&rdquo;
            </p>
          )}

          <div
            className="hero-fade mt-7 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "680ms" }}
          >
            <ButtonLink href="/shop" size="lg">
              shop today&rsquo;s batch
            </ButtonLink>
            <ButtonLink
              href="/gifting"
              size="lg"
              variant="ghost"
              className="border border-cream/30 text-cream hover:bg-cream/12"
            >
              gifting boxes
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* The hero fills the viewport, so say plainly that there is more below. */}
      <div
        aria-hidden
        className="hero-fade absolute bottom-6 right-6 hidden items-center gap-3 text-2xs uppercase tracking-[0.18em] text-cream/50 md:flex"
        style={{ animationDelay: "900ms" }}
      >
        scroll
        <span className="h-8 w-px bg-cream/30" />
      </div>
    </section>
  );
}

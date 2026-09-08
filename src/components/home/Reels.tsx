import { getReels } from "@/lib/media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReelPlayer } from "./ReelPlayer";

/**
 * The reels rail.
 *
 * Content-led marketing is this brand's stated strategy, so the videos get a
 * real place on the site rather than living only on Instagram — where the
 * audience is rented rather than owned.
 *
 * Renders nothing at all when no reels have been uploaded: an empty carousel
 * is worse than no carousel.
 */
export async function Reels() {
  const reels = await getReels(12);
  if (reels.length === 0) return null;

  return (
    <section className="pt-16 md:pt-24" aria-label="Reels from the taazo kitchen">
      <div className="container-taazo">
        <SectionHeading
          eyebrow="from the kitchen"
          title="What this morning looked like"
          intro="Sourcing, pressing, packing — filmed as it happens, not staged afterwards."
          action={{ href: "/reels", label: "see them all" }}
        />
      </div>

      {/*
        Full-bleed horizontal rail with scroll-snap. Deliberately not a
        JavaScript carousel: native overflow scrolling is smoother on a phone,
        works without JS, and needs no library.
      */}
      <div className="mt-12 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-4 px-(--gutter) [scroll-snap-type:x_mandatory]">
          {reels.map((reel) => (
            <li
              key={reel.id}
              className="w-[68vw] shrink-0 [scroll-snap-align:center] sm:w-64 lg:w-72"
            >
              <ReelPlayer reel={reel} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

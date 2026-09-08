import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { GiftingTeaser } from "@/components/home/GiftingTeaser";
import { ProcessSection } from "@/components/home/ProcessSection";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { Reviews } from "@/components/home/Reviews";
import { Reels } from "@/components/home/Reels";

/**
 * The hero advertises real bottles-remaining, so the page must not be frozen at
 * build time. A minute is close enough to live to stay honest without making
 * every visit a server render.
 */
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <GiftingTeaser />
      <ProcessSection />
      <StoryTeaser />
      <Reels />
      <Reviews />
    </>
  );
}

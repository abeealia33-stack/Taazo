import { db } from "./db";

export type HeroMedia = {
  type: "image" | "video";
  url: string;
  posterUrl: string | null;
};

/**
 * The hero background, set in admin.
 *
 * Returns null when nothing has been uploaded, in which case the hero falls
 * back to the featured product's photo and then to a designed gradient — so
 * the page is never broken, just less specific.
 */
export async function getHeroMedia(): Promise<HeroMedia | null> {
  const row = await db.setting.findUnique({ where: { key: "heroMedia" } });
  if (!row) return null;

  try {
    const parsed = JSON.parse(row.value) as Partial<HeroMedia>;
    if (!parsed.url) return null;
    return {
      type: parsed.type === "video" ? "video" : "image",
      url: parsed.url,
      posterUrl: parsed.posterUrl ?? null,
    };
  } catch {
    return null;
  }
}

export type PublicReel = {
  id: string;
  title: string | null;
  caption: string | null;
  videoUrl: string;
  posterUrl: string | null;
  externalUrl: string | null;
};

export async function getReels(limit = 12): Promise<PublicReel[]> {
  const reels = await db.reel.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });

  return reels.map((r) => ({
    id: r.id,
    title: r.title,
    caption: r.caption,
    videoUrl: r.videoUrl,
    posterUrl: r.posterUrl,
    externalUrl: r.externalUrl,
  }));
}

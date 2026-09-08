import { db } from "./db";
import { formatTime, todaysBatch } from "./batch";

export type LiveBatch = {
  code: string;
  pressedAtLabel: string;
  city: string;
  note: string | null;
  bottlesLeft: number;
  isLive: boolean;
};

/**
 * The batch the storefront advertises.
 *
 * Read from the database so that what the site claims is what the admin panel
 * actually opened this morning — the pressing time, the note, and the real
 * number of bottles left. If no batch is open (before the morning press, or
 * after close of day) it falls back to a clock-derived placeholder and reports
 * `isLive: false`, so the hero can say "ordering for tomorrow" instead of
 * inventing stock that does not exist.
 */
export async function getLiveBatch(): Promise<LiveBatch> {
  const batch = await db.batch.findFirst({
    where: { status: "live" },
    orderBy: { pressedAt: "desc" },
  });

  if (!batch) {
    const fallback = todaysBatch();
    return {
      code: fallback.code,
      pressedAtLabel: fallback.pressedAtLabel,
      city: fallback.city,
      note: null,
      bottlesLeft: 0,
      isLive: false,
    };
  }

  return {
    code: batch.code,
    pressedAtLabel: formatTime(batch.pressedAt),
    city: batch.city,
    note: batch.note,
    bottlesLeft: batch.stock.reduce((n, s) => n + s.available, 0),
    isLive: true,
  };
}

/**
 * Bottles still available per product slug, from the live batch.
 *
 * The shop reads this so a sold-out product is shown as sold out rather than
 * letting someone fill a basket and be rejected at checkout. An empty map means
 * no batch is open, which the caller treats as "everything is closed for today".
 */
export async function getAvailability(): Promise<Map<string, number>> {
  const batch = await db.batch.findFirst({
    where: { status: "live" },
    orderBy: { pressedAt: "desc" },
  });
  if (!batch) return new Map();
  return new Map(batch.stock.map((s) => [s.productSlug, s.available]));
}

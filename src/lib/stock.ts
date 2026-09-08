import { randomUUID } from "crypto";
import { db } from "./db";

/**
 * Stock reservation.
 *
 * A batch and all of its per-product stock live in a *single* document, and
 * MongoDB guarantees that a single-document update is atomic. So the whole
 * basket is reserved in one `findAndModify`:
 *
 *   - the filter asserts that EVERY line still has enough available stock,
 *     using one $elemMatch per line
 *   - the update decrements them all with positional array filters
 *
 * If any line is short, the filter matches nothing, no counter moves, and we
 * report which line failed. Two customers racing for the last bottle can never
 * both win.
 *
 * This deliberately avoids multi-document transactions. It was originally
 * written that way because the local MongoDB was a standalone server (which
 * rejects them); the server is now a single-node replica set, but the approach
 * is kept because one atomic document update is both simpler and cheaper than
 * a transaction, and it keeps the code portable to any MongoDB deployment.
 *
 * The order document is written immediately afterwards. If that write fails we
 * release the reservation; if the process dies in between,
 * `sweepStaleReservations` returns the stock. That is the compensation half.
 */

export type StockLine = { productSlug: string; qty: number };

/**
 * Prisma types $runCommandRaw's argument as a JSON object, which cannot express
 * arrayFilters (an array of objects). Casting once here keeps the cast out of
 * every call site.
 */
type RawCommand = Parameters<typeof db.$runCommandRaw>[0];

function runRaw(command: Record<string, unknown>) {
  return db.$runCommandRaw(command as unknown as RawCommand);
}

export type ReserveResult =
  | { ok: true; reservationId: string; batchCode: string }
  | { ok: false; reason: "no-batch" | "insufficient"; shortSlug?: string };

/** Aggregates a basket down to one entry per product. */
export function collapseLines(lines: StockLine[]): StockLine[] {
  const totals = new Map<string, number>();
  for (const line of lines) {
    totals.set(line.productSlug, (totals.get(line.productSlug) ?? 0) + line.qty);
  }
  return [...totals].map(([productSlug, qty]) => ({ productSlug, qty }));
}

export async function reserveStock(lines: StockLine[]): Promise<ReserveResult> {
  const needed = collapseLines(lines).filter((l) => l.qty > 0);
  if (needed.length === 0) {
    return { ok: false, reason: "insufficient" };
  }

  const batch = await db.batch.findFirst({
    where: { status: "live" },
    orderBy: { pressedAt: "desc" },
  });
  if (!batch) return { ok: false, reason: "no-batch" };

  const reservationId = randomUUID();

  // One $elemMatch per line: every one must be satisfiable for the update to apply.
  const conditions = needed.map((line) => ({
    stock: {
      $elemMatch: {
        productSlug: line.productSlug,
        available: { $gte: line.qty },
      },
    },
  }));

  const inc: Record<string, number> = {};
  const arrayFilters: Record<string, unknown>[] = [];
  needed.forEach((line, i) => {
    const id = `e${i}`;
    inc[`stock.$[${id}].available`] = -line.qty;
    inc[`stock.$[${id}].reserved`] = line.qty;
    arrayFilters.push({ [`${id}.productSlug`]: line.productSlug });
  });

  const result = (await runRaw({
    findAndModify: "Batch",
    query: { code: batch.code, status: "live", $and: conditions },
    update: { $inc: inc },
    arrayFilters,
    new: true,
  })) as { value?: unknown };

  if (!result?.value) {
    // Nothing moved. Work out which line is short, for a useful message.
    const fresh = await db.batch.findUnique({ where: { code: batch.code } });
    const short = needed.find((line) => {
      const row = fresh?.stock.find((s) => s.productSlug === line.productSlug);
      return !row || row.available < line.qty;
    });
    return { ok: false, reason: "insufficient", shortSlug: short?.productSlug };
  }

  return { ok: true, reservationId, batchCode: batch.code };
}

/** Undo a reservation — the order was never written, or it was cancelled. */
export async function releaseStock(batchCode: string, lines: StockLine[]) {
  const needed = collapseLines(lines).filter((l) => l.qty > 0);
  if (needed.length === 0) return;

  const inc: Record<string, number> = {};
  const arrayFilters: Record<string, unknown>[] = [];
  needed.forEach((line, i) => {
    const id = `e${i}`;
    inc[`stock.$[${id}].available`] = line.qty;
    inc[`stock.$[${id}].reserved`] = -line.qty;
    arrayFilters.push({ [`${id}.productSlug`]: line.productSlug });
  });

  await runRaw({
    findAndModify: "Batch",
    query: { code: batchCode },
    update: { $inc: inc },
    arrayFilters,
    new: true,
  });
}

/**
 * Convert a reservation into a sale. Called once the order document exists, so
 * the bottles move from `reserved` to `bottlesSold` and stop being recoverable.
 */
export async function commitStock(batchCode: string, lines: StockLine[]) {
  const needed = collapseLines(lines).filter((l) => l.qty > 0);
  if (needed.length === 0) return;

  const inc: Record<string, number> = {};
  const arrayFilters: Record<string, unknown>[] = [];
  needed.forEach((line, i) => {
    const id = `e${i}`;
    inc[`stock.$[${id}].reserved`] = -line.qty;
    inc[`stock.$[${id}].bottlesSold`] = line.qty;
    arrayFilters.push({ [`${id}.productSlug`]: line.productSlug });
  });

  await runRaw({
    findAndModify: "Batch",
    query: { code: batchCode },
    update: { $inc: inc },
    arrayFilters,
    new: true,
  });
}

/**
 * A delivery failed, so the bottles come back as unsold rather than vanishing.
 * Wastage data is the most valuable number in this business — it is never
 * silently discarded.
 */
export async function returnToUnsold(batchCode: string, lines: StockLine[]) {
  const needed = collapseLines(lines).filter((l) => l.qty > 0);
  if (needed.length === 0) return;

  const inc: Record<string, number> = {};
  const arrayFilters: Record<string, unknown>[] = [];
  needed.forEach((line, i) => {
    const id = `e${i}`;
    inc[`stock.$[${id}].bottlesSold`] = -line.qty;
    inc[`stock.$[${id}].unsold`] = line.qty;
    arrayFilters.push({ [`${id}.productSlug`]: line.productSlug });
  });

  await runRaw({
    findAndModify: "Batch",
    query: { code: batchCode },
    update: { $inc: inc },
    arrayFilters,
    new: true,
  });
}

/**
 * Safety net for a crash between reserving stock and writing the order.
 *
 * Anything still sitting in `reserved` on a live batch older than the window,
 * with no matching order, is returned to `available`. Run on server start and
 * from the admin panel.
 */
export async function sweepStaleReservations(windowMinutes = 15) {
  const cutoff = new Date(Date.now() - windowMinutes * 60_000);
  const batches = await db.batch.findMany({ where: { status: "live" } });

  let released = 0;

  for (const batch of batches) {
    const stuck = batch.stock.filter((s) => s.reserved > 0);
    if (stuck.length === 0) continue;

    // Reserved quantities that ARE accounted for by a recent order.
    const recentOrders = await db.order.findMany({
      where: { batchCode: batch.code, createdAt: { gte: cutoff } },
      select: { items: true },
    });

    const accounted = new Map<string, number>();
    for (const order of recentOrders) {
      for (const item of order.items) {
        accounted.set(
          item.productSlug,
          (accounted.get(item.productSlug) ?? 0) + item.qty,
        );
      }
    }

    const orphaned = stuck
      .map((s) => ({
        productSlug: s.productSlug,
        qty: s.reserved - (accounted.get(s.productSlug) ?? 0),
      }))
      .filter((l) => l.qty > 0);

    if (orphaned.length > 0) {
      await releaseStock(batch.code, orphaned);
      released += orphaned.reduce((n, l) => n + l.qty, 0);
    }
  }

  return released;
}

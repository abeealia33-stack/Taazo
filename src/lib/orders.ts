import { db } from "./db";
import { karachiNow } from "./batch";

/** Order numbers read TZ-DDMM-NNNN, restarting each day. */
export async function nextOrderNumber() {
  const local = karachiNow();
  const dd = String(local.getDate()).padStart(2, "0");
  const mm = String(local.getMonth() + 1).padStart(2, "0");

  const startOfDay = new Date(local);
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await db.order.count({
    where: { createdAt: { gte: startOfDay } },
  });

  return `TZ-${dd}${mm}-${String(todayCount + 1).padStart(4, "0")}`;
}

export async function getZones() {
  return db.deliveryZone.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function deliveryFeeFor(
  zone: { fee: number; minOrder: number },
  subtotal: number,
  freeOver: number,
) {
  if (freeOver > 0 && subtotal >= freeOver) return 0;
  return zone.fee;
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Delivery failed",
  cancelled: "Cancelled",
};

export const STATUS_FLOW = [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
] as const;

/** Records every status change, so an order's history is never guesswork. */
export async function recordEvent(
  orderId: string,
  toStatus: string,
  fromStatus?: string | null,
  note?: string,
  actorId?: string,
) {
  await db.orderEvent.create({
    data: { orderId, toStatus, fromStatus: fromStatus ?? null, note, actorId },
  });
}

/**
 * The cheapest active delivery fee and the free-delivery threshold.
 *
 * The storefront quotes delivery in a few places (product page, FAQ). Reading
 * it from the zones means changing a fee in admin updates every one of them,
 * rather than leaving stale numbers on the site.
 */
export async function getDeliverySummary() {
  const [zones, freeOver] = await Promise.all([
    db.deliveryZone.findMany({ where: { active: true } }),
    getSetting("freeDeliveryOver", 3000),
  ]);

  const fees = zones.map((z) => z.fee);
  return {
    from: fees.length > 0 ? Math.min(...fees) : 0,
    freeOver,
    zoneCount: zones.length,
  };
}

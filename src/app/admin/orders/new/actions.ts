"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, audit } from "@/lib/auth";
import {
  nextOrderNumber,
  deliveryFeeFor,
  getSetting,
  recordEvent,
} from "@/lib/orders";
import { reserveStock, releaseStock, commitStock, type StockLine } from "@/lib/stock";
import { karachiNow, isBeforeCutoff } from "@/lib/batch";
import { formatPKR } from "@/lib/utils";

/**
 * Manual order entry.
 *
 * A real share of orders arrive on WhatsApp or by phone. If those live in a
 * notebook instead of here, every report is wrong, stock is wrong, and the
 * batch numbers stop meaning anything. So they go through exactly the same
 * stock reservation and numbering as a web order — only `source` differs.
 */

const ManualSchema = z.object({
  customerName: z.string().min(2, "Name"),
  phone: z.string().min(7, "Phone number"),
  addressLine: z.string().min(5, "Address"),
  zoneId: z.string().min(1, "Area"),
  deliverySlot: z.enum(["morning", "afternoon", "evening"]),
  paymentMethod: z.enum(["cod", "transfer"]),
  source: z.enum(["whatsapp", "phone"]),
  notes: z.string().max(500).optional(),
});

export type ManualOrderState = { error?: string };

export async function createManualOrder(
  _prev: ManualOrderState,
  formData: FormData,
): Promise<ManualOrderState> {
  const session = await requireAdmin();

  const parsed = ManualSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    addressLine: formData.get("addressLine"),
    zoneId: formData.get("zoneId"),
    deliverySlot: formData.get("deliverySlot"),
    paymentMethod: formData.get("paymentMethod"),
    source: formData.get("source"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: `Missing or invalid: ${String(issue?.path[0] ?? "field")}`,
    };
  }
  const input = parsed.data;

  // Quantities arrive as qty-<slug> fields, one per active product.
  const products = await db.product.findMany({ where: { active: true } });
  const chosen = products
    .map((p) => ({
      product: p,
      qty: Number(formData.get(`qty-${p.slug}`) ?? 0),
    }))
    .filter((line) => line.qty > 0);

  if (chosen.length === 0) {
    return { error: "Add at least one product." };
  }

  const items = chosen.map(({ product, qty }) => ({
    productSlug: product.slug,
    nameSnapshot: product.name,
    priceSnapshot: product.price,
    qty,
    size: product.size,
    isGiftBox: false,
    giftItems: [] as string[],
  }));

  const subtotal = items.reduce((n, i) => n + i.priceSnapshot * i.qty, 0);

  const zone = await db.deliveryZone.findUnique({ where: { id: input.zoneId } });
  if (!zone) return { error: "That delivery zone no longer exists." };

  const freeOver = await getSetting("freeDeliveryOver", 3000);
  const deliveryFee = deliveryFeeFor(zone, subtotal, freeOver);
  const total = subtotal + deliveryFee;

  const cutoffHour = zone.sameDayCutoff ?? (await getSetting("sameDayCutoffHour", 13));
  const deliveryDate = karachiNow();
  if (!isBeforeCutoff(cutoffHour)) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }
  deliveryDate.setHours(12, 0, 0, 0);

  const stockLines: StockLine[] = items.map((i) => ({
    productSlug: i.productSlug,
    qty: i.qty,
  }));

  const reservation = await reserveStock(stockLines);
  if (!reservation.ok) {
    if (reservation.reason === "no-batch") {
      return { error: "No batch is open — open one before taking orders." };
    }
    const short = products.find((p) => p.slug === reservation.shortSlug);
    return {
      error: short
        ? `Not enough ${short.name} left in today's batch.`
        : "Not enough stock in today's batch.",
    };
  }

  let orderId: string;

  try {
    const orderNumber = await nextOrderNumber();
    const order = await db.order.create({
      data: {
        orderNumber,
        status: "confirmed", // taken by a human, so it is already confirmed
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        customerName: input.customerName,
        phone: input.phone,
        addressLine: input.addressLine,
        area: zone.name,
        city: "Lahore",
        zoneId: zone.id,
        deliveryDate,
        deliverySlot: input.deliverySlot,
        items,
        subtotal,
        deliveryFee,
        total,
        batchCode: reservation.batchCode,
        notes: input.notes || null,
        source: input.source,
        idempotencyKey: randomUUID(),
      },
    });

    await commitStock(reservation.batchCode, stockLines);
    await recordEvent(
      order.id,
      "confirmed",
      null,
      `Taken by ${session.name} via ${input.source}`,
      session.userId,
    );
    await audit(
      session,
      "Order",
      order.id,
      `manual order ${orderNumber}`,
      formatPKR(total),
    );

    orderId = order.id;
  } catch (error) {
    await releaseStock(reservation.batchCode, stockLines);
    console.error("createManualOrder failed", error);
    return { error: "Could not save the order. Nothing was charged to stock." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/");
  redirect(`/admin/orders/${orderId}`);
}

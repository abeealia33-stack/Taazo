"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { mailer } from "@/lib/mailer";
import { storage, validateUpload } from "@/lib/storage";
import {
  nextOrderNumber,
  deliveryFeeFor,
  getSetting,
  recordEvent,
} from "@/lib/orders";
import {
  reserveStock,
  releaseStock,
  commitStock,
  type StockLine,
} from "@/lib/stock";
import { karachiNow, isBeforeCutoff } from "@/lib/batch";
import { formatPKR } from "@/lib/utils";

const LineSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  qty: z.number().int().min(1).max(50),
  size: z.string(),
  isGiftBox: z.boolean().default(false),
  giftItems: z.array(z.string()).default([]),
  noteCard: z.string().max(200).optional(),
  recipientName: z.string().max(80).optional(),
});

const CheckoutSchema = z.object({
  customerName: z.string().min(2, "Please tell us your name"),
  phone: z
    .string()
    .regex(/^0?3\d{2}[\s-]?\d{7}$/, "Enter a Pakistani mobile number, e.g. 0300 1234567"),
  altPhone: z.string().optional(),
  // Optional: phone is the real identity here, email is a convenience.
  email: z
    .string()
    .email("That email does not look right")
    .optional()
    .or(z.literal("")),
  addressLine: z.string().min(8, "We need a full address to find you"),
  area: z.string().min(2, "Please choose your area"),
  zoneId: z.string().min(1, "Please choose your area"),
  deliverySlot: z.enum(["morning", "afternoon", "evening"]),
  paymentMethod: z.enum(["cod", "transfer"]),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().min(8),
  lines: z.array(LineSchema).min(1, "Your basket is empty"),
});

export type CheckoutState = {
  ok: boolean;
  orderNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  // ---- parse ----
  let payload: unknown;
  try {
    payload = {
      ...Object.fromEntries(formData.entries()),
      lines: JSON.parse(String(formData.get("lines") ?? "[]")),
    };
  } catch {
    return { ok: false, error: "Something went wrong reading your basket." };
  }

  const parsed = CheckoutSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const input = parsed.data;

  // ---- idempotency: a double-tapped submit must not create two orders ----
  const existing = await db.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return { ok: true, orderNumber: existing.orderNumber };

  // ---- pricing, recomputed server-side. Never trust the client's totals ----
  const products = await db.product.findMany({
    where: { slug: { in: input.lines.map((l) => l.slug) }, active: true },
  });

  let subtotal = 0;
  const items = input.lines.map((line) => {
    // A configured gift box has no Product row; its price is validated below.
    const product = products.find((p) => p.slug === line.slug);
    const unit = product ? product.price : line.price;
    subtotal += unit * line.qty;
    return {
      productSlug: line.slug,
      nameSnapshot: product?.name ?? line.name,
      priceSnapshot: unit,
      qty: line.qty,
      size: product?.size ?? line.size,
      isGiftBox: line.isGiftBox,
      giftItems: line.giftItems,
      noteCard: line.noteCard,
      recipientName: line.recipientName,
    };
  });

  const zone = await db.deliveryZone.findUnique({ where: { id: input.zoneId } });
  if (!zone || !zone.active) {
    return { ok: false, error: "We do not deliver to that area yet." };
  }
  if (subtotal < zone.minOrder) {
    return {
      ok: false,
      error: `Orders to ${zone.name} start at ${formatPKR(zone.minOrder)}.`,
    };
  }

  const freeOver = await getSetting("freeDeliveryOver", 3000);
  const deliveryFee = deliveryFeeFor(zone, subtotal, freeOver);
  const total = subtotal + deliveryFee;

  // ---- delivery date: after the cutoff, today is no longer on offer ----
  // Each zone carries its own cutoff, because the far ones need an earlier
  // one to make the run. The global setting is only the fallback.
  const globalCutoff = await getSetting("sameDayCutoffHour", 13);
  const cutoffHour = zone.sameDayCutoff ?? globalCutoff;
  const deliveryDate = karachiNow();
  if (!isBeforeCutoff(cutoffHour)) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }
  deliveryDate.setHours(12, 0, 0, 0);

  // ---- reserve stock BEFORE writing the order ----
  const stockLines: StockLine[] = items
    .filter((i) => !i.isGiftBox)
    .map((i) => ({ productSlug: i.productSlug, qty: i.qty }));

  let batchCode: string | null = null;
  let reserved = false;

  if (stockLines.length > 0) {
    const reservation = await reserveStock(stockLines);
    if (!reservation.ok) {
      if (reservation.reason === "no-batch") {
        return {
          ok: false,
          error:
            "Today's batch is closed. We are pressing again tomorrow morning — try then.",
        };
      }
      const short = products.find((p) => p.slug === reservation.shortSlug);
      return {
        ok: false,
        error: short
          ? `${short.name} has just sold out for today. Please reduce the quantity or remove it.`
          : "Something in your basket has just sold out for today.",
      };
    }
    batchCode = reservation.batchCode;
    reserved = true;
  }

  // ---- write the order; release the reservation if that fails ----
  try {
    const orderNumber = await nextOrderNumber();

    const order = await db.order.create({
      data: {
        orderNumber,
        status: "pending",
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        customerName: input.customerName,
        phone: input.phone,
        altPhone: input.altPhone || null,
        addressLine: input.addressLine,
        area: input.area,
        city: "Lahore",
        zoneId: zone.id,
        deliveryDate,
        deliverySlot: input.deliverySlot,
        items,
        subtotal,
        deliveryFee,
        total,
        batchCode,
        notes: input.notes || null,
        source: "web",
        idempotencyKey: input.idempotencyKey,
      },
    });

    // ---- payment proof, if one was attached ----
    const proof = formData.get("paymentProof");
    if (input.paymentMethod === "transfer" && proof instanceof File && proof.size > 0) {
      const invalid = validateUpload(proof);
      if (!invalid) {
        const { url } = await storage.put(proof, "payment-proofs");
        await db.order.update({
          where: { id: order.id },
          data: { paymentProof: { url, uploadedAt: new Date() } },
        });
      }
    }

    if (reserved && batchCode) await commitStock(batchCode, stockLines);
    await recordEvent(order.id, "pending", null, "Order placed on the website");

    const itemLines = items.map(
      (i) => `  ${i.qty} × ${i.nameSnapshot}  ${formatPKR(i.priceSnapshot * i.qty)}`,
    );
    const deliveryDay = deliveryDate.toLocaleDateString("en-PK", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Asia/Karachi",
    });

    // The customer's own confirmation. Email is best-effort — the phone number
    // is what we actually rely on — so a failure here must never fail the order.
    if (input.email) {
      await mailer.send({
        to: input.email,
        subject: `Your taazo order ${orderNumber}`,
        text: [
          `Thank you — we have your order.`,
          "",
          `Order   ${orderNumber}`,
          `Batch   ${batchCode ?? "tomorrow's press"}`,
          `Arriving ${deliveryDay}, ${input.deliverySlot}`,
          "",
          ...itemLines,
          "",
          `Subtotal  ${formatPKR(subtotal)}`,
          `Delivery  ${formatPKR(deliveryFee)}`,
          `Total     ${formatPKR(total)}`,
          "",
          input.paymentMethod === "cod"
            ? "Please have the cash ready for the rider."
            : "We will confirm once your transfer is verified.",
          "",
          "We confirm every order on WhatsApp before it goes out.",
          "taazo. — pressed this morning, bottled by noon.",
        ].join("\n"),
      });
    }

    await mailer.send({
      to: process.env.ORDER_NOTIFY_EMAIL || "orders@taazo.pk",
      subject: `New order ${orderNumber} — ${formatPKR(total)}`,
      text: [
        `Order ${orderNumber}`,
        `Batch ${batchCode ?? "—"}`,
        "",
        ...items.map((i) => `  ${i.qty} × ${i.nameSnapshot}  ${formatPKR(i.priceSnapshot * i.qty)}`),
        "",
        `Subtotal  ${formatPKR(subtotal)}`,
        `Delivery  ${formatPKR(deliveryFee)}`,
        `Total     ${formatPKR(total)}`,
        "",
        `${input.customerName} · ${input.phone}`,
        `${input.addressLine}, ${input.area}, Lahore`,
        `${input.deliverySlot} slot`,
        `Payment: ${input.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer"}`,
        input.notes ? `Note: ${input.notes}` : "",
      ].join("\n"),
    });

    return { ok: true, orderNumber };
  } catch (error) {
    // Compensate: the bottles must not stay reserved for an order that failed.
    if (reserved && batchCode) await releaseStock(batchCode, stockLines);
    console.error("placeOrder failed", error);
    return {
      ok: false,
      error: "We could not save your order. Please try again, or WhatsApp us.",
    };
  }
}

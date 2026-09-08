"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireOwner, audit } from "@/lib/auth";
import { recordEvent } from "@/lib/orders";
import { returnToUnsold, sweepStaleReservations } from "@/lib/stock";
import { batchCode, karachiNow } from "@/lib/batch";

// ---------------------------------------------------------------- orders

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "failed"],
  failed: ["out_for_delivery", "cancelled"],
  delivered: [],
  cancelled: [],
};

export async function setOrderStatus(formData: FormData) {
  const session = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const to = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "") || undefined;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  // Server-side guard: the UI offering a button is not the rule.
  if (!NEXT_STATUS[order.status]?.includes(to)) return;

  await db.order.update({
    where: { id: orderId },
    data: { status: to },
  });

  // A failed delivery returns bottles as unsold rather than losing the data —
  // wastage is the number that tells you how much to press tomorrow.
  if ((to === "failed" || to === "cancelled") && order.batchCode) {
    await returnToUnsold(
      order.batchCode,
      order.items
        .filter((i) => !i.isGiftBox)
        .map((i) => ({ productSlug: i.productSlug, qty: i.qty })),
    );
  }

  await recordEvent(orderId, to, order.status, note, session.userId);
  await audit(session, "Order", orderId, `status → ${to}`, note);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function addOrderNote(formData: FormData) {
  const session = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 500);

  await db.order.update({ where: { id: orderId }, data: { notes } });
  await audit(session, "Order", orderId, "note updated");
  revalidatePath(`/admin/orders/${orderId}`);
}

// --------------------------------------------------------------- payments

export async function reviewPayment(formData: FormData) {
  const session = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "") || undefined;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order?.paymentProof) return;

  if (decision === "verify") {
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "verified",
        paymentProof: {
          ...order.paymentProof,
          verifiedAt: new Date(),
          verifiedBy: session.name,
        },
      },
    });
  } else if (decision === "reject") {
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "rejected",
        paymentProof: { ...order.paymentProof, rejectedReason: reason ?? "Not clear" },
      },
    });
  }

  await audit(session, "Order", orderId, `payment ${decision}`, reason);
  revalidatePath("/admin/payments");
  revalidatePath(`/admin/orders/${orderId}`);
}

// ---------------------------------------------------------------- batches

const OpenBatchSchema = z.object({
  pressedHour: z.coerce.number().min(0).max(23),
  pressedMinute: z.coerce.number().min(0).max(59),
  note: z.string().max(160).optional(),
});

export async function openBatch(formData: FormData) {
  const session = await requireAdmin();
  const parsed = OpenBatchSchema.safeParse({
    pressedHour: formData.get("pressedHour"),
    pressedMinute: formData.get("pressedMinute"),
    note: formData.get("note"),
  });
  if (!parsed.success) return;

  // A new batch on the same day gets the next letter, so B follows A.
  const base = batchCode();
  const existingToday = await db.batch.count({
    where: { code: { startsWith: base.slice(0, 6) } },
  });
  const code = `${base.slice(0, 6)}${String.fromCharCode(65 + existingToday)}`;

  const pressedAt = karachiNow();
  pressedAt.setHours(parsed.data.pressedHour, parsed.data.pressedMinute, 0, 0);

  const products = await db.product.findMany({ where: { active: true } });
  const stock = products.map((p) => {
    const made = Number(formData.get(`made-${p.slug}`) ?? 0);
    return {
      productSlug: p.slug,
      bottlesMade: made,
      available: made,
      bottlesSold: 0,
      reserved: 0,
      unsold: 0,
      wasted: 0,
    };
  });

  // Only one batch is live at a time; the previous one closes automatically.
  await db.batch.updateMany({
    where: { status: "live" },
    data: { status: "closed", closedAt: new Date() },
  });

  const batch = await db.batch.create({
    data: {
      code,
      pressedAt,
      city: "Lahore",
      note: parsed.data.note || null,
      status: "live",
      stock,
    },
  });

  await audit(session, "Batch", batch.id, `opened batch ${code}`);
  revalidatePath("/admin");
  revalidatePath("/admin/batches");
  revalidatePath("/");
}

export async function closeBatch(formData: FormData) {
  const session = await requireAdmin();
  const batchId = String(formData.get("batchId") ?? "");

  const batch = await db.batch.findUnique({ where: { id: batchId } });
  if (!batch) return;

  // Whatever is still available at close of day was not sold. Recording it is
  // the whole point of the batch system.
  const stock = batch.stock.map((s) => {
    const wasted = Number(formData.get(`wasted-${s.productSlug}`) ?? 0);
    return {
      ...s,
      unsold: s.available + s.reserved,
      wasted,
      available: 0,
      reserved: 0,
    };
  });

  await db.batch.update({
    where: { id: batchId },
    data: { status: "closed", closedAt: new Date(), stock },
  });

  await audit(session, "Batch", batchId, `closed batch ${batch.code}`);
  revalidatePath("/admin");
  revalidatePath("/admin/batches");
  revalidatePath("/");
}

export async function adjustStock(formData: FormData) {
  const session = await requireAdmin();
  const batchId = String(formData.get("batchId") ?? "");
  const slug = String(formData.get("productSlug") ?? "");
  const delta = Number(formData.get("delta") ?? 0);

  const batch = await db.batch.findUnique({ where: { id: batchId } });
  if (!batch) return;

  const stock = batch.stock.map((s) =>
    s.productSlug === slug
      ? {
          ...s,
          bottlesMade: Math.max(0, s.bottlesMade + delta),
          available: Math.max(0, s.available + delta),
        }
      : s,
  );

  await db.batch.update({ where: { id: batchId }, data: { stock } });
  await audit(session, "Batch", batchId, `stock ${slug} ${delta > 0 ? "+" : ""}${delta}`);
  revalidatePath("/admin/batches");
  revalidatePath("/");
}

export async function runReservationSweep() {
  const session = await requireAdmin();
  const released = await sweepStaleReservations(15);
  await audit(session, "Batch", "-", `reservation sweep released ${released}`);
  revalidatePath("/admin/batches");
}

// --------------------------------------------------------------- products

export async function toggleProduct(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("productId") ?? "");
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return;

  await db.product.update({
    where: { id },
    data: { active: !product.active },
  });
  await audit(
    session,
    "Product",
    id,
    product.active ? "deactivated" : "activated",
  );
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

const ProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(2),
  tagline: z.string().max(120),
  description: z.string().max(2000),
  price: z.coerce.number().int().min(0),
  size: z.string().max(40),
  category: z.string().min(1).optional(),
  featured: z.coerce.boolean().optional(),
});

export async function updateProduct(formData: FormData) {
  const session = await requireOwner(); // prices are owner-only
  const parsed = ProductSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    price: formData.get("price"),
    size: formData.get("size"),
    category: formData.get("category") ?? undefined,
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) return;

  const { productId, category, ...data } = parsed.data;

  /**
   * Nutrition arrives as parallel label/value fields — nutrition-label-0,
   * nutrition-value-0, and so on. Rows with a blank label are dropped, so
   * clearing a label deletes that row and the form always renders a few spare
   * blanks to add more. Sending no fields at all leaves nutrition untouched.
   */
  const nutrition: { label: string; value: string }[] = [];
  let sawNutritionField = false;
  for (let i = 0; formData.has(`nutrition-label-${i}`); i += 1) {
    sawNutritionField = true;
    const label = String(formData.get(`nutrition-label-${i}`) ?? "").trim();
    const value = String(formData.get(`nutrition-value-${i}`) ?? "").trim();
    if (label) nutrition.push({ label: label.slice(0, 60), value: value.slice(0, 120) });
  }

  // Ingredients arrive as a comma-separated string from the form.
  const rawIngredients = formData.get("ingredients");
  const ingredients =
    rawIngredients === null
      ? undefined
      : String(rawIngredients)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

  const product = await db.product.update({
    where: { id: productId },
    data: {
      ...data,
      featured: Boolean(data.featured),
      ...(category ? { category } : {}),
      ...(ingredients ? { ingredients } : {}),
      ...(sawNutritionField ? { nutrition } : {}),
    },
  });

  await audit(session, "Product", productId, "updated", `price ${data.price}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${product.slug}`);
  revalidatePath("/gifting");
  revalidatePath("/");
}

// --------------------------------------------------------------- settings

export async function updateSetting(formData: FormData) {
  const session = await requireOwner();
  const key = String(formData.get("key") ?? "");
  const raw = String(formData.get("value") ?? "");
  if (!key) return;

  // Values are stored JSON-encoded so numbers and booleans survive round-trips.
  let value = raw;
  try {
    JSON.parse(raw);
  } catch {
    value = JSON.stringify(raw);
  }

  const existing = await db.setting.findUnique({ where: { key } });
  if (existing) {
    await db.setting.update({ where: { key }, data: { value } });
  } else {
    await db.setting.create({ data: { key, value } });
  }

  await audit(session, "Setting", key, "updated");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

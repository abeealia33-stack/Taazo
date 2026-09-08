"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, audit } from "@/lib/auth";
import { recordEvent } from "@/lib/orders";

/**
 * Riders and dispatch.
 *
 * This is the 1pm-to-2pm part of the day: everything is packed, and it now has
 * to be split between whoever is delivering it.
 */

function revalidateDelivery() {
  revalidatePath("/admin");
  revalidatePath("/admin/delivery");
  revalidatePath("/admin/orders");
}

const RiderSchema = z.object({
  name: z.string().min(2, "Give the rider a name"),
  phone: z.string().min(7, "A phone number, so you can reach them"),
});

export async function createRider(formData: FormData) {
  const session = await requireAdmin();
  const parsed = RiderSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return;

  const rider = await db.rider.create({
    data: { name: parsed.data.name, phone: parsed.data.phone, active: true },
  });

  await audit(session, "Rider", rider.id, "added", parsed.data.name);
  revalidateDelivery();
}

export async function toggleRider(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("riderId") ?? "");
  const rider = await db.rider.findUnique({ where: { id } });
  if (!rider) return;

  await db.rider.update({ where: { id }, data: { active: !rider.active } });
  await audit(
    session,
    "Rider",
    id,
    rider.active ? "marked unavailable" : "marked available",
    rider.name,
  );
  revalidateDelivery();
}

export async function assignRider(formData: FormData) {
  const session = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const riderId = String(formData.get("riderId") ?? "");

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await db.order.update({
    where: { id: orderId },
    data: { riderId: riderId || null },
  });

  const rider = riderId
    ? await db.rider.findUnique({ where: { id: riderId } })
    : null;

  await audit(
    session,
    "Order",
    orderId,
    rider ? `assigned to ${rider.name}` : "rider unassigned",
  );
  revalidateDelivery();
}

/**
 * Send a whole rider's run out in one go.
 *
 * Nobody taps through forty orders individually, and making them do so is how
 * statuses stop being kept up to date at all.
 */
export async function dispatchRider(formData: FormData) {
  const session = await requireAdmin();
  const riderId = String(formData.get("riderId") ?? "");
  if (!riderId) return;

  const orders = await db.order.findMany({
    where: { riderId, status: "packed" },
  });

  for (const order of orders) {
    await db.order.update({
      where: { id: order.id },
      data: { status: "out_for_delivery" },
    });
    await recordEvent(
      order.id,
      "out_for_delivery",
      order.status,
      "Dispatched with the rider's run",
      session.userId,
    );
  }

  await audit(
    session,
    "Rider",
    riderId,
    `dispatched ${orders.length} order${orders.length === 1 ? "" : "s"}`,
  );
  revalidateDelivery();
}

/** Advance every confirmed order to packed once the batch is boxed. */
export async function markAllPacked() {
  const session = await requireAdmin();
  const orders = await db.order.findMany({ where: { status: "confirmed" } });

  for (const order of orders) {
    await db.order.update({ where: { id: order.id }, data: { status: "packed" } });
    await recordEvent(order.id, "packed", order.status, "Packed in bulk", session.userId);
  }

  await audit(session, "Order", "-", `marked ${orders.length} packed`);
  revalidateDelivery();
}

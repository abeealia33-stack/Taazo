"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner, audit } from "@/lib/auth";

/**
 * Delivery zones.
 *
 * These are load-bearing: the checkout dropdown, the delivery fee, the minimum
 * order and the same-day cutoff all read from here, so a change lands on the
 * storefront immediately. Every path that shows a fee is revalidated below.
 */

function revalidateDelivery() {
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/shop", "layout");
  revalidatePath("/faq");
  revalidatePath("/");
}

const ZoneSchema = z.object({
  name: z.string().min(2, "Give the zone a name"),
  areas: z.string().max(600),
  fee: z.coerce.number().int().min(0).max(100000),
  minOrder: z.coerce.number().int().min(0).max(1000000),
  sameDayCutoff: z.coerce.number().int().min(0).max(23),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

function parseAreas(raw: string) {
  return raw
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

export async function createZone(formData: FormData) {
  const session = await requireOwner();
  const parsed = ZoneSchema.safeParse({
    name: formData.get("name"),
    areas: formData.get("areas") ?? "",
    fee: formData.get("fee") ?? 0,
    minOrder: formData.get("minOrder") ?? 0,
    sameDayCutoff: formData.get("sameDayCutoff") ?? 13,
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return;

  const zone = await db.deliveryZone.create({
    data: {
      name: parsed.data.name,
      areas: parseAreas(parsed.data.areas),
      fee: parsed.data.fee,
      minOrder: parsed.data.minOrder,
      sameDayCutoff: parsed.data.sameDayCutoff,
      sortOrder: parsed.data.sortOrder,
      active: true,
    },
  });

  await audit(session, "DeliveryZone", zone.id, "created", parsed.data.name);
  revalidateDelivery();
}

export async function updateZone(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("zoneId") ?? "");
  const parsed = ZoneSchema.safeParse({
    name: formData.get("name"),
    areas: formData.get("areas") ?? "",
    fee: formData.get("fee") ?? 0,
    minOrder: formData.get("minOrder") ?? 0,
    sameDayCutoff: formData.get("sameDayCutoff") ?? 13,
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!id || !parsed.success) return;

  await db.deliveryZone.update({
    where: { id },
    data: {
      name: parsed.data.name,
      areas: parseAreas(parsed.data.areas),
      fee: parsed.data.fee,
      minOrder: parsed.data.minOrder,
      sameDayCutoff: parsed.data.sameDayCutoff,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await audit(
    session,
    "DeliveryZone",
    id,
    "updated",
    `fee ${parsed.data.fee}, min ${parsed.data.minOrder}`,
  );
  revalidateDelivery();
}

export async function toggleZone(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("zoneId") ?? "");
  const zone = await db.deliveryZone.findUnique({ where: { id } });
  if (!zone) return;

  await db.deliveryZone.update({
    where: { id },
    data: { active: !zone.active },
  });

  await audit(
    session,
    "DeliveryZone",
    id,
    zone.active ? "stopped delivering" : "resumed delivering",
    zone.name,
  );
  revalidateDelivery();
}

export async function deleteZone(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("zoneId") ?? "");
  const zone = await db.deliveryZone.findUnique({ where: { id } });
  if (!zone) return;

  // Past orders reference the zone they were delivered to. Deleting one that
  // is in use would orphan those records, so it is refused — turning it off
  // is what was almost certainly meant anyway.
  const inUse = await db.order.count({ where: { zoneId: id } });
  if (inUse > 0) return;

  await db.deliveryZone.delete({ where: { id } });
  await audit(session, "DeliveryZone", id, "deleted", zone.name);
  revalidateDelivery();
}

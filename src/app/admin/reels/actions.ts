"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireAdmin, audit } from "@/lib/auth";

/**
 * Reel management. Uploading happens in the route handler at
 * /api/admin/upload (video is too large for a Server Action body); everything
 * else — editing, reordering, deleting — lives here.
 */

function revalidateReels() {
  revalidatePath("/");
  revalidatePath("/reels");
  revalidatePath("/admin/reels");
}

export async function updateReel(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("reelId") ?? "");
  if (!id) return;

  await db.reel.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? "").slice(0, 80) || null,
      caption: String(formData.get("caption") ?? "").slice(0, 200) || null,
      externalUrl: String(formData.get("externalUrl") ?? "").slice(0, 400) || null,
    },
  });

  await audit(session, "Reel", id, "updated");
  revalidateReels();
}

export async function toggleReel(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("reelId") ?? "");
  const reel = await db.reel.findUnique({ where: { id } });
  if (!reel) return;

  await db.reel.update({ where: { id }, data: { active: !reel.active } });
  await audit(session, "Reel", id, reel.active ? "hidden" : "shown");
  revalidateReels();
}

export async function reorderReel(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("reelId") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const reel = await db.reel.findUnique({ where: { id } });
  if (!reel) return;

  const neighbour = await db.reel.findFirst({
    where:
      direction === "up"
        ? { sortOrder: { lt: reel.sortOrder } }
        : { sortOrder: { gt: reel.sortOrder } },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await db.reel.update({
    where: { id: reel.id },
    data: { sortOrder: neighbour.sortOrder },
  });
  await db.reel.update({
    where: { id: neighbour.id },
    data: { sortOrder: reel.sortOrder },
  });

  await audit(session, "Reel", id, `moved ${direction}`);
  revalidateReels();
}

export async function deleteReel(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("reelId") ?? "");
  const reel = await db.reel.findUnique({ where: { id } });
  if (!reel) return;

  // A reel has no downstream references, so unlike a product it can genuinely
  // be deleted — including its files, which are large and worth reclaiming.
  for (const url of [reel.videoUrl, reel.posterUrl]) {
    if (url?.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", url));
      } catch {
        // The file may already be gone; the database row still goes.
      }
    }
  }

  await db.reel.delete({ where: { id } });
  await audit(session, "Reel", id, "deleted");
  revalidateReels();
}

export async function clearHeroMedia() {
  const session = await requireAdmin();
  const existing = await db.setting.findUnique({ where: { key: "heroMedia" } });
  if (!existing) return;

  try {
    const parsed = JSON.parse(existing.value) as {
      url?: string;
      posterUrl?: string | null;
    };
    for (const url of [parsed.url, parsed.posterUrl]) {
      if (url?.startsWith("/uploads/")) {
        try {
          await unlink(path.join(process.cwd(), "public", url));
        } catch {
          // already gone
        }
      }
    }
  } catch {
    // Unparseable value — clearing it is still the right outcome.
  }

  await db.setting.delete({ where: { key: "heroMedia" } });
  await audit(session, "Setting", "heroMedia", "cleared");
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

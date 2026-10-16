import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";

export const HOMEPAGE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const HOMEPAGE_IMAGE_FILENAME = /^([a-f0-9]{64})\.webp$/;

export function homepageUploadsAvailable() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.DATABASE_URL?.trim());
}

/** Input has already been decoded, resized and converted to WebP by the API. */
export async function storeHomepageImage(bytes: Uint8Array): Promise<{ url: string }> {
  if (!bytes.byteLength || bytes.byteLength > HOMEPAGE_IMAGE_MAX_BYTES) {
    throw new Error("HOMEPAGE_IMAGE_SIZE");
  }
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return storage.put(new File([new Uint8Array(bytes)], "homepage.webp", { type: "image/webp" }), "chulimaar");
  }

  const id = createHash("sha256").update(bytes).digest("hex");
  // Duplicate content reuses an immutable URL rather than storing another copy.
  try {
    await db.homepageImage.upsert({ where: { id }, create: { id, data: new Uint8Array(bytes), byteSize: bytes.byteLength }, update: {} });
  } catch (error) {
    // Two simultaneous first uploads can race on MongoDB's primary-key index.
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== "P2002") throw error;
  }
  return { url: `/media/chulimaar/${id}.webp` };
}

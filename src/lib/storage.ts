import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

/**
 * File storage, behind an interface.
 *
 * Development writes to public/uploads/ so photos, videos and payment proofs
 * work with no cloud account. Setting BLOB_READ_WRITE_TOKEN switches to Vercel
 * Blob for production without touching any call site.
 */

export interface StorageAdapter {
  put(file: File, prefix: string): Promise<{ url: string }>;
}

/**
 * Limits.
 *
 * Everything now uploads through the route handler at /api/admin/upload, which
 * streams the request body and has no framework-imposed cap — so these numbers
 * are the only limit, and they are set by what is actually sensible to store
 * rather than by what Next.js will tolerate.
 *
 * Uploaded files are stored byte-for-byte. Nothing is re-encoded on the way in;
 * only the derivative that next/image serves is compressed.
 */
export const IMAGE_MAX_BYTES = 32 * 1024 * 1024; // 32MB — a full-frame RAW export
export const VIDEO_MAX_BYTES = 256 * 1024 * 1024; // 256MB — a few minutes of 4K

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function mb(bytes: number) {
  return Math.round(bytes / (1024 * 1024));
}

export function validateUpload(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) {
    return "Please upload a JPG, PNG, WebP or AVIF image.";
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return `That image is ${mb(file.size)}MB. The limit is ${mb(IMAGE_MAX_BYTES)}MB.`;
  }
  return null;
}

export function validateVideoUpload(file: File) {
  if (!VIDEO_TYPES.includes(file.type)) {
    return "Please upload an MP4, WebM or MOV video.";
  }
  if (file.size > VIDEO_MAX_BYTES) {
    return `That video is ${mb(file.size)}MB. The limit is ${mb(VIDEO_MAX_BYTES)}MB.`;
  }
  return null;
}

/** Accepts either an image or a video — used by the hero, which takes both. */
export function validateMedia(file: File) {
  if (VIDEO_TYPES.includes(file.type)) return validateVideoUpload(file);
  return validateUpload(file);
}

export function isVideo(file: File) {
  return VIDEO_TYPES.includes(file.type);
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function extensionFor(file: File) {
  return (
    EXT_BY_TYPE[file.type] ??
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ??
    "bin"
  );
}

class LocalDiskStorage implements StorageAdapter {
  async put(file: File, prefix: string) {
    const dir = path.join(process.cwd(), "public", "uploads", prefix);
    await mkdir(dir, { recursive: true });

    const name = `${randomUUID()}.${extensionFor(file)}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), bytes);

    return { url: `/uploads/${prefix}/${name}` };
  }
}

class VercelBlobStorage implements StorageAdapter {
  async put(file: File, prefix: string) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${prefix}/${randomUUID()}.${extensionFor(file)}`, file, {
      access: "public",
    });
    return { url: blob.url };
  }
}

export const storage: StorageAdapter = process.env.BLOB_READ_WRITE_TOKEN
  ? new VercelBlobStorage()
  : new LocalDiskStorage();

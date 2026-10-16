import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { getSession } from "@/lib/auth";
import { storage, validateUpload } from "@/lib/storage";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "owner") return NextResponse.json({ error: "Owner access is required." }, { status: 403 });
  // Use the configured public origin behind a reverse proxy; the internal
  // Next.js request URL may be localhost even for a same-site browser upload.
  const origin = process.env.CHULIMAAR_SITE_URL ? new URL(process.env.CHULIMAAR_SITE_URL).origin : request.nextUrl.origin;
  if (request.headers.get("origin") !== origin) return NextResponse.json({ error: "Please upload from the website editor." }, { status: 403 });
  if (process.env.NODE_ENV === "production" && !process.env.BLOB_READ_WRITE_TOKEN?.trim()) return NextResponse.json({ error: "Photo uploads are being set up. Please try again once storage is ready." }, { status: 503 });
  if (Number(request.headers.get("content-length") || 0) > 9 * 1024 * 1024) return NextResponse.json({ error: "Choose a photo smaller than 8MB." }, { status: 413 });
  try {
    const form = await request.formData();
    const photo = form.get("photo");
    if (!(photo instanceof File) || !photo.size) return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
    if (photo.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Choose a photo smaller than 8MB." }, { status: 413 });
    const invalid = validateUpload(photo);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    let bytes: Buffer;
    try { bytes = await sharp(Buffer.from(await photo.arrayBuffer()), { limitInputPixels: 40_000_000 }).rotate().resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer(); }
    catch { return NextResponse.json({ error: "This file could not be read as a photograph. Choose a JPG, PNG, WebP or AVIF image." }, { status: 400 }); }
    const image = new File([new Uint8Array(bytes)], "homepage.webp", { type: "image/webp" });
    const { url } = await storage.put(image, "chulimaar");
    return NextResponse.json({ url });
  } catch { return NextResponse.json({ error: "The photo could not be uploaded. Please try again." }, { status: 500 }); }
}

import { db } from "@/lib/db";
import { HOMEPAGE_IMAGE_FILENAME } from "@/lib/homepage-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const match = HOMEPAGE_IMAGE_FILENAME.exec(filename);
  if (!match) return new Response("Image not found.", { status: 404, headers: { "Cache-Control": "no-store" } });

  try {
    const image = await db.homepageImage.findUnique({ where: { id: match[1] } });
    if (!image) return new Response("Image not found.", { status: 404, headers: { "Cache-Control": "no-store" } });
    const etag = `"${image.id}"`;
    const headers = {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `inline; filename="${filename}"`,
      ETag: etag,
    };
    const matches = request.headers.get("if-none-match")?.split(",").some(value => [etag, `W/${etag}`, "*"].includes(value.trim()));
    if (matches) return new Response(null, { status: 304, headers });
    return new Response(new Uint8Array(image.data), { headers: { ...headers, "Content-Length": String(image.byteSize) } });
  } catch {
    // Do not cache an unavailable database as a permanent missing photograph.
    return new Response("This image is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } });
  }
}

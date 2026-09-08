import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession, audit } from "@/lib/auth";
import {
  storage,
  validateVideoUpload,
  validateUpload,
  validateMedia,
  isVideo,
} from "@/lib/storage";
import { revalidatePath } from "next/cache";

/**
 * Large-file uploads: reels and hero media.
 *
 * These go through a route handler rather than a Server Action because Server
 * Actions cap request bodies (12MB here, and raising it much further is not
 * wise) while route handlers stream the body with no such limit. Video needs
 * that headroom.
 *
 * The forms POST here directly and get redirected back, so this works with
 * JavaScript disabled exactly as it does with it enabled.
 */

export const runtime = "nodejs";
// Uploads must never be cached or statically analysed.
export const dynamic = "force-dynamic";

function back(request: NextRequest, to: string, error?: string) {
  const url = new URL(to, request.nextUrl.origin);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  // Auth is checked here, not in middleware — the Edge runtime cannot reach
  // the database, so the cookie's signature is only meaningful server-side.
  const session = await getSession();
  if (!session) {
    return back(request, "/admin/login");
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  // ------------------------------------------------------------- new reels
  if (intent === "reel") {
    // The input is `multiple`, so several videos can arrive at once. Each one
    // becomes its own reel, appended in the order they were selected.
    const videos = form
      .getAll("video")
      .filter((v): v is File => v instanceof File && v.size > 0);

    if (videos.length === 0) {
      return back(request, "/admin/reels", "Choose at least one video to upload.");
    }

    // Validate everything BEFORE writing anything, so a bad file in the middle
    // of a batch does not leave half the reels created.
    for (const video of videos) {
      const invalid = validateVideoUpload(video);
      if (invalid) {
        return back(request, "/admin/reels", `${video.name}: ${invalid}`);
      }
    }

    // A poster is optional but strongly worth having: it is what people see
    // before the video has downloaded, and on data-saver connections it may be
    // all they ever see. Posters are matched to videos by position; a single
    // poster with several videos applies to the first only.
    const posters = form
      .getAll("poster")
      .filter((p): p is File => p instanceof File && p.size > 0);

    const last = await db.reel.findFirst({ orderBy: { sortOrder: "desc" } });
    let sortOrder = (last?.sortOrder ?? 0) + 1;

    // Title and caption only make sense on a single upload — applying one
    // caption to eight different videos would be worse than leaving them blank.
    const single = videos.length === 1;
    const created: string[] = [];

    for (const [i, video] of videos.entries()) {
      const { url: videoUrl } = await storage.put(video, "reels");

      let posterUrl: string | null = null;
      const poster = posters[i];
      if (poster && !validateUpload(poster)) {
        posterUrl = (await storage.put(poster, "reels")).url;
      }

      const reel = await db.reel.create({
        data: {
          title: single
            ? String(form.get("title") ?? "").slice(0, 80) || null
            : null,
          caption: single
            ? String(form.get("caption") ?? "").slice(0, 200) || null
            : null,
          externalUrl: single
            ? String(form.get("externalUrl") ?? "").slice(0, 400) || null
            : null,
          videoUrl,
          posterUrl,
          sortOrder: sortOrder++,
          active: true,
        },
      });
      created.push(reel.id);
    }

    await audit(
      session,
      "Reel",
      created.join(","),
      `uploaded ${created.length} reel${created.length > 1 ? "s" : ""}`,
    );
    revalidatePath("/");
    revalidatePath("/admin/reels");
    return back(request, "/admin/reels");
  }

  // ---------------------------------------------------- product photos
  if (intent === "product-photo") {
    const productId = String(form.get("productId") ?? "");
    const backTo = `/admin/products/${productId}`;

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return back(request, "/admin/products", "Product not found.");

    const photos = form
      .getAll("photo")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (photos.length === 0) {
      return back(request, backTo, "Choose at least one image.");
    }

    // Validate the whole batch first, so one bad file cannot leave a product
    // with half its photos uploaded.
    for (const photo of photos) {
      const invalid = validateUpload(photo);
      if (invalid) return back(request, backTo, `${photo.name}: ${invalid}`);
    }

    const urls: string[] = [];
    for (const photo of photos) {
      const { url } = await storage.put(photo, "products");
      urls.push(url);
    }

    await db.product.update({
      where: { id: productId },
      data: { photos: [...product.photos, ...urls] },
    });

    await audit(
      session,
      "Product",
      productId,
      `uploaded ${urls.length} photo${urls.length === 1 ? "" : "s"}`,
    );

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${product.slug}`);
    revalidatePath(backTo);
    return back(request, backTo);
  }

  // -------------------------------------------------------- hero media
  if (intent === "hero") {
    const media = form.get("media");
    if (!(media instanceof File) || media.size === 0) {
      return back(request, "/admin/settings", "Choose an image or video.");
    }

    const invalid = validateMedia(media);
    if (invalid) return back(request, "/admin/settings", invalid);

    const { url } = await storage.put(media, "hero");
    const type = isVideo(media) ? "video" : "image";

    // A hero video needs a poster, or the first paint is a black rectangle.
    let posterUrl: string | null = null;
    const poster = form.get("poster");
    if (poster instanceof File && poster.size > 0) {
      if (!validateUpload(poster)) {
        posterUrl = (await storage.put(poster, "hero")).url;
      }
    }

    const value = JSON.stringify({ type, url, posterUrl });
    const existing = await db.setting.findUnique({ where: { key: "heroMedia" } });
    if (existing) {
      await db.setting.update({ where: { key: "heroMedia" }, data: { value } });
    } else {
      await db.setting.create({ data: { key: "heroMedia", value } });
    }

    await audit(session, "Setting", "heroMedia", `hero ${type} set`);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return back(request, "/admin/settings");
  }

  return back(request, "/admin", "Unknown upload.");
}

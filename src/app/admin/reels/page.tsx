import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading, Card, EmptyState } from "@/components/admin/ui";
import { VIDEO_MAX_BYTES } from "@/lib/storage";
import { updateReel, toggleReel, reorderReel, deleteReel } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const reels = await db.reel.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <AdminHeading
        title="Reels"
        subtitle="Short vertical videos, shown on the homepage in this order."
      />

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-terracotta/40 bg-terracotta/8 px-5 py-4 text-sm text-terracotta-deep"
        >
          {error}
        </p>
      )}

      <Card className="mb-6 border-terracotta/25 bg-terracotta/[0.04]">
        <h2 className="text-lg tracking-tight text-charcoal">Upload a reel</h2>
        <p className="mt-1 text-sm text-sand-600">
          Shoot vertical (9:16). MP4, WebM or MOV, up to{" "}
          {Math.round(VIDEO_MAX_BYTES / (1024 * 1024))}MB each. Select several
          at once to upload a batch — title and caption apply to single uploads
          only, and you can add them per reel afterwards.
        </p>

        {/*
          Posts straight to the route handler rather than a Server Action:
          Server Actions cap the request body, and video blows past that cap.
        */}
        <form
          action="/api/admin/upload"
          method="post"
          encType="multipart/form-data"
          className="mt-5 grid gap-4"
        >
          <input type="hidden" name="intent" value="reel" />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">
                Videos * <span className="text-sand-500">— pick one or many</span>
              </span>
              <input
                type="file"
                name="video"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
                required
                className="text-sm text-sand-700 file:mr-4 file:rounded-full file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-cream"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">
                Cover images <span className="text-sand-500">(recommended)</span>
              </span>
              <input
                type="file"
                name="poster"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="text-sm text-sand-700 file:mr-4 file:rounded-full file:border-0 file:bg-sand-300 file:px-4 file:py-2 file:text-charcoal"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">Title</span>
              <input
                name="title"
                maxLength={80}
                placeholder="Pressing day"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-sand-600">
                Instagram link <span className="text-sand-500">(optional)</span>
              </span>
              <input
                name="externalUrl"
                type="url"
                placeholder="https://instagram.com/p/…"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs text-sand-600">Caption</span>
              <input
                name="caption"
                maxLength={200}
                placeholder="6:40am, everything still cold"
                className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
              />
            </label>
          </div>

          <button className="w-fit rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep">
            upload reel
          </button>
          <p className="text-xs text-sand-600">
            Large files take a moment — the page will reload when it is done.
          </p>
        </form>
      </Card>

      {reels.length === 0 ? (
        <EmptyState
          title="No reels yet"
          body="Upload one above and it appears on the homepage straight away."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reels.map((reel, i) => (
            <li key={reel.id}>
              <Card className="flex flex-col gap-3">
                <div className="relative aspect-9/16 overflow-hidden rounded-lg bg-charcoal">
                  <video
                    src={reel.videoUrl}
                    poster={reel.posterUrl ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  {!reel.active && (
                    <span className="absolute left-2 top-2 rounded-full bg-charcoal/85 px-2.5 py-1 text-2xs uppercase tracking-[0.1em] text-cream">
                      hidden
                    </span>
                  )}
                </div>

                <details>
                  <summary className="cursor-pointer text-sm text-charcoal">
                    {reel.title || "Untitled reel"}
                  </summary>
                  <form action={updateReel} className="mt-3 grid gap-2">
                    <input type="hidden" name="reelId" value={reel.id} />
                    <input
                      name="title"
                      defaultValue={reel.title ?? ""}
                      placeholder="Title"
                      className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                    />
                    <input
                      name="caption"
                      defaultValue={reel.caption ?? ""}
                      placeholder="Caption"
                      className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                    />
                    <input
                      name="externalUrl"
                      defaultValue={reel.externalUrl ?? ""}
                      placeholder="Instagram link"
                      className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                    />
                    <button className="w-fit rounded-full bg-charcoal px-4 py-2 text-xs text-cream transition-colors hover:bg-sand-800">
                      save
                    </button>
                  </form>
                </details>

                <div className="flex flex-wrap items-center gap-1.5">
                  <form action={reorderReel}>
                    <input type="hidden" name="reelId" value={reel.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      disabled={i === 0}
                      aria-label="Move reel earlier"
                      className="grid h-8 w-8 place-items-center rounded-full bg-sand-200 transition-colors hover:bg-sand-300 disabled:opacity-30"
                    >
                      ←
                    </button>
                  </form>
                  <form action={reorderReel}>
                    <input type="hidden" name="reelId" value={reel.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      disabled={i === reels.length - 1}
                      aria-label="Move reel later"
                      className="grid h-8 w-8 place-items-center rounded-full bg-sand-200 transition-colors hover:bg-sand-300 disabled:opacity-30"
                    >
                      →
                    </button>
                  </form>

                  <form action={toggleReel}>
                    <input type="hidden" name="reelId" value={reel.id} />
                    <button
                      className={
                        reel.active
                          ? "rounded-full bg-olive/15 px-3.5 py-2 text-xs text-olive transition-colors hover:bg-olive/25"
                          : "rounded-full bg-sand-300 px-3.5 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                      }
                    >
                      {reel.active ? "visible" : "hidden"}
                    </button>
                  </form>

                  <form action={deleteReel} className="ml-auto">
                    <input type="hidden" name="reelId" value={reel.id} />
                    <button className="rounded-full border border-terracotta/40 px-3.5 py-2 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10">
                      delete
                    </button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

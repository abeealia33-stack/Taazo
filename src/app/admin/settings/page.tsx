import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading, Card } from "@/components/admin/ui";
import { updateSetting } from "../actions";
import { clearHeroMedia } from "../reels/actions";
import { getHeroMedia } from "@/lib/media";
import { IMAGE_MAX_BYTES, VIDEO_MAX_BYTES } from "@/lib/storage";
import { DeliveryZones } from "@/components/admin/DeliveryZones";

export const dynamic = "force-dynamic";

const FIELDS = [
  {
    key: "whatsappNumber",
    label: "WhatsApp number",
    hint: "International format, no + or spaces. e.g. 923001234567",
  },
  {
    key: "sameDayCutoffHour",
    label: "Same-day cutoff hour",
    hint: "24-hour, Asia/Karachi. 13 means orders after 1pm go out tomorrow.",
  },
  {
    key: "freeDeliveryOver",
    label: "Free delivery over (Rs)",
    hint: "Set to 0 to always charge delivery.",
  },
  {
    key: "bankDetails",
    label: "Bank / JazzCash details",
    hint: "Shown at checkout when a customer chooses bank transfer. JSON.",
    long: true,
  },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireOwner();
  const { error } = await searchParams;

  const [settings, zones, audits, hero] = await Promise.all([
    db.setting.findMany(),
    db.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    getHeroMedia(),
  ]);

  // A zone that has been delivered to cannot be deleted without orphaning
  // those orders, so the button is disabled rather than failing on click.
  const zoneUsage = await Promise.all(
    zones.map(async (z) => ({
      id: z.id,
      orders: await db.order.count({ where: { zoneId: z.id } }),
    })),
  );
  const ordersIn = (id: string) =>
    zoneUsage.find((z) => z.id === id)?.orders ?? 0;

  const mb = (bytes: number) => Math.round(bytes / (1024 * 1024));

  const valueOf = (key: string) =>
    settings.find((s) => s.key === key)?.value ?? "";

  return (
    <>
      <AdminHeading
        title="Settings"
        subtitle="These drive the storefront. Changes take effect immediately."
      />

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-terracotta/40 bg-terracotta/8 px-5 py-4 text-sm text-terracotta-deep"
        >
          {error}
        </p>
      )}

      {/* Hero media -------------------------------------------------- */}
      <Card className="mb-6 border-terracotta/25 bg-terracotta/[0.04]">
        <h2 className="text-lg tracking-tight text-charcoal">
          Homepage hero background
        </h2>
        <p className="mt-1 text-sm text-sand-600">
          An image or a video, shown full-screen behind the headline. Without
          one, the hero falls back to your featured product&rsquo;s photo.
        </p>

        {hero && (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="relative h-28 w-44 overflow-hidden rounded-lg bg-charcoal">
              {hero.type === "video" ? (
                <video
                  src={hero.url}
                  poster={hero.posterUrl ?? undefined}
                  muted
                  loop
                  playsInline
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero.url}
                  alt="Current hero background"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-charcoal">
                Currently a {hero.type}
              </p>
              <form action={clearHeroMedia} className="mt-2">
                <button className="rounded-full border border-terracotta/40 px-4 py-2 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10">
                  remove
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Posts to the route handler so video is not capped by the
            Server Action body limit. */}
        <form
          action="/api/admin/upload"
          method="post"
          encType="multipart/form-data"
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="intent" value="hero" />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Image or video *</span>
            <input
              type="file"
              name="media"
              accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
              required
              className="text-sm text-sand-700 file:mr-4 file:rounded-full file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-cream"
            />
            <span className="text-xs text-sand-600">
              Images up to {mb(IMAGE_MAX_BYTES)}MB, video up to{" "}
              {mb(VIDEO_MAX_BYTES)}MB. Landscape, with quiet space on the left
              for the headline.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">
              Cover image <span className="text-sand-500">(video only)</span>
            </span>
            <input
              type="file"
              name="poster"
              accept="image/png,image/jpeg,image/webp"
              className="text-sm text-sand-700 file:mr-4 file:rounded-full file:border-0 file:bg-sand-300 file:px-4 file:py-2 file:text-charcoal"
            />
            <span className="text-xs text-sand-600">
              Shown while the video loads. Worth adding — without it the first
              paint is black.
            </span>
          </label>

          <div className="sm:col-span-2">
            <button className="rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              save hero background
            </button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {FIELDS.map((field) => (
          <Card key={field.key}>
            <form action={updateSetting} className="flex flex-col gap-2">
              <input type="hidden" name="key" value={field.key} />
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-charcoal">{field.label}</span>
                {field.long ? (
                  <textarea
                    name="value"
                    rows={5}
                    defaultValue={valueOf(field.key)}
                    className="resize-none rounded-md border border-sand-300 bg-cream px-3 py-2 font-mono text-xs"
                  />
                ) : (
                  <input
                    name="value"
                    defaultValue={valueOf(field.key)}
                    className="rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm"
                  />
                )}
                <span className="text-xs text-sand-600">{field.hint}</span>
              </label>
              <button className="mt-1 w-fit rounded-full bg-charcoal px-4 py-2 text-sm text-cream transition-colors hover:bg-sand-800">
                save
              </button>
            </form>
          </Card>
        ))}
      </div>

      <DeliveryZones zones={zones} ordersIn={ordersIn} />

      <h2 className="mb-3 mt-8 text-lg tracking-tight text-charcoal">
        Recent activity
      </h2>
      <Card>
        <ul className="flex flex-col gap-2 text-sm">
          {audits.map((log) => (
            <li
              key={log.id}
              className="flex justify-between gap-4 border-b border-sand-100 pb-2 last:border-0"
            >
              <span className="text-sand-700">
                <span className="text-charcoal">{log.actorName}</span>{" "}
                {log.action} · {log.entity}
                {log.detail && (
                  <span className="text-sand-500"> — {log.detail}</span>
                )}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-sand-500">
                {log.createdAt.toLocaleString("en-PK", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Karachi",
                })}
              </span>
            </li>
          ))}
          {audits.length === 0 && (
            <li className="py-6 text-center text-sand-600">Nothing logged yet.</li>
          )}
        </ul>
      </Card>
    </>
  );
}

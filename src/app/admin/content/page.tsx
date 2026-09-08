import Image from "next/image";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/utils";
import { AdminHeading, Card, EmptyState } from "@/components/admin/ui";
import {
  createTestimonial,
  updateTestimonial,
  toggleTestimonial,
  deleteTestimonial,
  createFaqGroup,
  updateFaqGroup,
  toggleFaqGroup,
  deleteFaqGroup,
  createStoryChapter,
  updateStoryChapter,
  uploadStoryChapterPhoto,
  toggleStoryChapter,
  deleteStoryChapter,
  createGiftTier,
  updateGiftTier,
  toggleGiftTier,
  deleteGiftTier,
} from "../content-actions";

export const dynamic = "force-dynamic";

const field =
  "rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm focus:border-terracotta focus:outline-none";
const ACCENTS = [
  "var(--color-fruit-carrot)",
  "var(--color-fruit-mango)",
  "var(--color-fruit-dragon)",
  "var(--color-fruit-kiwi)",
  "var(--color-fruit-melon)",
  "var(--color-fruit-peach)",
  "var(--color-gold)",
];

function AccentPicker({ name, defaultValue }: { name: string; defaultValue: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ACCENTS.map((a, i) => (
        <label key={a} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={a}
            defaultChecked={a === defaultValue || (i === 0 && !defaultValue)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="block h-6 w-6 rounded-full ring-2 ring-transparent transition-all peer-checked:ring-charcoal"
            style={{ background: a }}
          />
        </label>
      ))}
    </div>
  );
}

export default async function AdminContentPage() {
  await requireOwner();

  const [testimonials, faqGroups, chapters, tiers] = await Promise.all([
    db.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    db.faqGroup.findMany({ orderBy: { sortOrder: "asc" } }),
    db.storyChapter.findMany({ orderBy: { sortOrder: "asc" } }),
    db.giftTier.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <AdminHeading
        title="Content"
        subtitle="The words and pictures on story, FAQ, reviews and gifting. Changes go live immediately."
      />

      {/* ============================================================ Story */}
      <h2 className="mb-3 mt-2 text-lg tracking-tight text-charcoal">
        Story chapters
      </h2>
      <div className="flex flex-col gap-4">
        {chapters.map((c) => (
          <Card key={c.id}>
            <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
              <div>
                <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-sand-200">
                  {c.photo ? (
                    <Image
                      src={c.photo}
                      alt={c.title}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className="absolute inset-0"
                      style={{
                        background: `color-mix(in oklab, ${c.accent} 35%, var(--color-cream))`,
                      }}
                    />
                  )}
                </div>
                <form
                  action={uploadStoryChapterPhoto}
                  encType="multipart/form-data"
                  className="mt-2"
                >
                  <input type="hidden" name="chapterId" value={c.id} />
                  <input
                    type="file"
                    name="photo"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="w-full text-2xs text-sand-700 file:mr-2 file:rounded-full file:border-0 file:bg-charcoal file:px-3 file:py-1.5 file:text-cream"
                  />
                </form>
              </div>

              <form action={updateStoryChapter} className="grid gap-3">
                <input type="hidden" name="chapterId" value={c.id} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-sand-600">Eyebrow</span>
                    <input name="eyebrow" defaultValue={c.eyebrow} className={field} />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-xs text-sand-600">Title</span>
                    <input name="title" defaultValue={c.title} className={field} />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-sand-600">
                    Body — blank line between paragraphs
                  </span>
                  <textarea
                    name="body"
                    rows={5}
                    defaultValue={c.body.join("\n\n")}
                    className={`${field} resize-none`}
                  />
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <AccentPicker name="accent" defaultValue={c.accent} />
                  <label className="flex items-center gap-2 text-xs text-sand-600">
                    order
                    <input
                      type="number"
                      name="sortOrder"
                      min={0}
                      defaultValue={c.sortOrder}
                      className={`${field} w-16 tabular-nums`}
                    />
                  </label>
                  <button className="ml-auto rounded-full bg-charcoal px-5 py-2 text-sm text-cream transition-colors hover:bg-sand-800">
                    save
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-3 flex gap-2 border-t border-sand-200 pt-3">
              <form action={toggleStoryChapter}>
                <input type="hidden" name="chapterId" value={c.id} />
                <button
                  className={
                    c.active
                      ? "rounded-full bg-olive/15 px-4 py-1.5 text-xs text-olive transition-colors hover:bg-olive/25"
                      : "rounded-full bg-sand-300 px-4 py-1.5 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                  }
                >
                  {c.active ? "visible" : "hidden"}
                </button>
              </form>
              <form action={deleteStoryChapter} className="ml-auto">
                <input type="hidden" name="chapterId" value={c.id} />
                <button className="rounded-full border border-terracotta/40 px-4 py-1.5 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10">
                  delete
                </button>
              </form>
            </div>
          </Card>
        ))}

        <Card className="border-terracotta/25 bg-terracotta/[0.04]">
          <h3 className="text-base text-charcoal">New chapter</h3>
          <form
            action={createStoryChapter}
            encType="multipart/form-data"
            className="mt-4 grid gap-3"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="eyebrow" required placeholder="why" className={field} />
              <input
                name="title"
                required
                placeholder="Title"
                className={`${field} sm:col-span-2`}
              />
            </div>
            <textarea
              name="body"
              rows={4}
              required
              placeholder="First paragraph.&#10;&#10;Second paragraph."
              className={`${field} resize-none`}
            />
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="file"
                name="photo"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="text-sm text-sand-700 file:mr-3 file:rounded-full file:border-0 file:bg-sand-300 file:px-3 file:py-1.5 file:text-charcoal"
              />
              <AccentPicker name="accent" defaultValue="" />
            </div>
            <button className="w-fit rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              add chapter
            </button>
          </form>
        </Card>
      </div>

      {/* ============================================================== FAQ */}
      <h2 className="mb-3 mt-10 text-lg tracking-tight text-charcoal">FAQ</h2>
      <div className="flex flex-col gap-4">
        {faqGroups.map((g) => (
          <Card key={g.id}>
            <form action={updateFaqGroup} className="grid gap-3">
              <input type="hidden" name="groupId" value={g.id} />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  name="heading"
                  defaultValue={g.heading}
                  className={`${field} max-w-xs`}
                />
                <label className="flex items-center gap-2 text-xs text-sand-600">
                  order
                  <input
                    type="number"
                    name="sortOrder"
                    min={0}
                    defaultValue={g.sortOrder}
                    className={`${field} w-16 tabular-nums`}
                  />
                </label>
                {!g.active && (
                  <span className="text-xs text-sand-500">hidden</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {[...g.items, { question: "", answer: "" }, { question: "", answer: "" }].map(
                  (item, i) => (
                    <div key={i} className="grid gap-2 rounded-lg bg-sand-100 p-3">
                      <input
                        name={`faq-q-${i}`}
                        defaultValue={item.question}
                        placeholder="Question"
                        className={field}
                      />
                      <textarea
                        name={`faq-a-${i}`}
                        defaultValue={item.answer}
                        placeholder="Answer"
                        rows={2}
                        className={`${field} resize-none`}
                      />
                    </div>
                  ),
                )}
              </div>
              <p className="text-xs text-sand-600">
                Clear a question to remove it. Save to get two more blanks.
              </p>
              <button className="w-fit rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                save group
              </button>
            </form>

            <div className="mt-3 flex gap-2 border-t border-sand-200 pt-3">
              <form action={toggleFaqGroup}>
                <input type="hidden" name="groupId" value={g.id} />
                <button
                  className={
                    g.active
                      ? "rounded-full bg-olive/15 px-4 py-1.5 text-xs text-olive transition-colors hover:bg-olive/25"
                      : "rounded-full bg-sand-300 px-4 py-1.5 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                  }
                >
                  {g.active ? "visible" : "hidden"}
                </button>
              </form>
              <form action={deleteFaqGroup} className="ml-auto">
                <input type="hidden" name="groupId" value={g.id} />
                <button className="rounded-full border border-terracotta/40 px-4 py-1.5 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10">
                  delete group
                </button>
              </form>
            </div>
          </Card>
        ))}

        <Card className="border-terracotta/25 bg-terracotta/[0.04]">
          <h3 className="text-base text-charcoal">New FAQ group</h3>
          <form action={createFaqGroup} className="mt-4 flex flex-wrap items-end gap-3">
            <input name="heading" required placeholder="Payment" className={field} />
            <button className="rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              add group
            </button>
          </form>
        </Card>
      </div>

      {/* ======================================================= Testimonials */}
      <h2 className="mb-3 mt-10 text-lg tracking-tight text-charcoal">
        Reviews
      </h2>
      {testimonials.length === 0 && (
        <EmptyState title="No reviews yet" body="Add real customer words below." />
      )}
      <div className="flex flex-col gap-3">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <form action={updateTestimonial} className="grid gap-3">
              <input type="hidden" name="testimonialId" value={t.id} />
              <textarea
                name="quote"
                defaultValue={t.quote}
                rows={2}
                className={`${field} resize-none`}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input name="name" defaultValue={t.name} className={field} />
                <input name="city" defaultValue={t.city} className={field} />
                <input
                  type="number"
                  name="sortOrder"
                  min={0}
                  defaultValue={t.sortOrder}
                  className={`${field} tabular-nums`}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <AccentPicker name="accent" defaultValue={t.accent} />
                <button className="ml-auto rounded-full bg-charcoal px-5 py-2 text-sm text-cream transition-colors hover:bg-sand-800">
                  save
                </button>
              </div>
            </form>
            <div className="mt-3 flex gap-2 border-t border-sand-200 pt-3">
              <form action={toggleTestimonial}>
                <input type="hidden" name="testimonialId" value={t.id} />
                <button
                  className={
                    t.active
                      ? "rounded-full bg-olive/15 px-4 py-1.5 text-xs text-olive transition-colors hover:bg-olive/25"
                      : "rounded-full bg-sand-300 px-4 py-1.5 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                  }
                >
                  {t.active ? "visible" : "hidden"}
                </button>
              </form>
              <form action={deleteTestimonial} className="ml-auto">
                <input type="hidden" name="testimonialId" value={t.id} />
                <button className="rounded-full border border-terracotta/40 px-4 py-1.5 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10">
                  delete
                </button>
              </form>
            </div>
          </Card>
        ))}

        <Card className="border-terracotta/25 bg-terracotta/[0.04]">
          <h3 className="text-base text-charcoal">New review</h3>
          <form action={createTestimonial} className="mt-4 grid gap-3">
            <textarea
              name="quote"
              required
              rows={2}
              placeholder="What they actually said"
              className={`${field} resize-none`}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Name" className={field} />
              <input name="city" required placeholder="City" className={field} />
            </div>
            <button className="w-fit rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              add review
            </button>
          </form>
        </Card>
      </div>

      {/* ======================================================= Gift tiers */}
      <h2 className="mb-3 mt-10 text-lg tracking-tight text-charcoal">
        Gift box tiers
      </h2>
      <p className="mb-3 text-sm text-sand-600">
        The sizes and prices on the gifting page and in the box builder.
      </p>
      <div className="flex flex-col gap-3">
        {tiers.map((t) => (
          <Card key={t.id}>
            <form action={updateGiftTier} className="grid gap-3 sm:grid-cols-5">
              <input type="hidden" name="tierId" value={t.id} />
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs text-sand-600">Name</span>
                <input name="name" defaultValue={t.name} className={field} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-sand-600">Bottles</span>
                <input
                  type="number"
                  name="bottles"
                  min={1}
                  defaultValue={t.bottles}
                  className={`${field} tabular-nums`}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-sand-600">Price (Rs)</span>
                <input
                  type="number"
                  name="price"
                  min={0}
                  defaultValue={t.price}
                  className={`${field} tabular-nums`}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-sand-600">Order</span>
                <input
                  type="number"
                  name="sortOrder"
                  min={0}
                  defaultValue={t.sortOrder}
                  className={`${field} tabular-nums`}
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-5">
                <span className="text-xs text-sand-600">Blurb</span>
                <input name="blurb" defaultValue={t.blurb} className={field} />
              </label>
              <div className="sm:col-span-5">
                <button className="rounded-full bg-charcoal px-5 py-2 text-sm text-cream transition-colors hover:bg-sand-800">
                  save · currently {formatPKR(t.price)}
                </button>
              </div>
            </form>
            <div className="mt-3 flex gap-2 border-t border-sand-200 pt-3">
              <form action={toggleGiftTier}>
                <input type="hidden" name="tierId" value={t.id} />
                <button
                  className={
                    t.active
                      ? "rounded-full bg-olive/15 px-4 py-1.5 text-xs text-olive transition-colors hover:bg-olive/25"
                      : "rounded-full bg-sand-300 px-4 py-1.5 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                  }
                >
                  {t.active ? "visible" : "hidden"}
                </button>
              </form>
              <form action={deleteGiftTier} className="ml-auto">
                <input type="hidden" name="tierId" value={t.id} />
                <button className="rounded-full border border-terracotta/40 px-4 py-1.5 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10">
                  delete
                </button>
              </form>
            </div>
          </Card>
        ))}

        <Card className="border-terracotta/25 bg-terracotta/[0.04]">
          <h3 className="text-base text-charcoal">New tier</h3>
          <form action={createGiftTier} className="mt-4 grid gap-3 sm:grid-cols-4">
            <input name="name" required placeholder="Box of eight" className={field} />
            <input
              type="number"
              name="bottles"
              required
              min={1}
              placeholder="8"
              className={`${field} tabular-nums`}
            />
            <input
              type="number"
              name="price"
              required
              min={0}
              placeholder="3600"
              className={`${field} tabular-nums`}
            />
            <input name="blurb" placeholder="Blurb" className={field} />
            <div className="sm:col-span-4">
              <button className="rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terracotta-deep">
                add tier
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}

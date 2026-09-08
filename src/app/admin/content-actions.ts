"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner, audit } from "@/lib/auth";
import { storage, validateUpload } from "@/lib/storage";

/**
 * Editorial content: testimonials, FAQ, story chapters, gift tiers.
 *
 * All owner-only — this is brand voice and pricing, not day-to-day ops. Every
 * mutation revalidates the storefront page it feeds plus its own admin screen.
 */

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/story");
  revalidatePath("/faq");
  revalidatePath("/gifting");
  revalidatePath("/admin/content");
}

async function deleteLocalUpload(url: string | null) {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    // already gone
  }
}

// ------------------------------------------------------------ testimonials

const TestimonialSchema = z.object({
  quote: z.string().min(10, "Needs an actual quote"),
  name: z.string().min(2, "Customer name"),
  city: z.string().min(2, "City"),
  accent: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createTestimonial(formData: FormData) {
  const session = await requireOwner();
  const parsed = TestimonialSchema.safeParse({
    quote: formData.get("quote"),
    name: formData.get("name"),
    city: formData.get("city"),
    accent: formData.get("accent") || "var(--color-fruit-carrot)",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return;

  const t = await db.testimonial.create({ data: { ...parsed.data, active: true } });
  await audit(session, "Testimonial", t.id, "created", parsed.data.name);
  revalidateContent();
}

export async function updateTestimonial(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("testimonialId") ?? "");
  const parsed = TestimonialSchema.safeParse({
    quote: formData.get("quote"),
    name: formData.get("name"),
    city: formData.get("city"),
    accent: formData.get("accent") || "var(--color-fruit-carrot)",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!id || !parsed.success) return;

  await db.testimonial.update({ where: { id }, data: parsed.data });
  await audit(session, "Testimonial", id, "updated");
  revalidateContent();
}

export async function toggleTestimonial(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("testimonialId") ?? "");
  const t = await db.testimonial.findUnique({ where: { id } });
  if (!t) return;

  await db.testimonial.update({ where: { id }, data: { active: !t.active } });
  await audit(session, "Testimonial", id, t.active ? "hidden" : "shown");
  revalidateContent();
}

export async function deleteTestimonial(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("testimonialId") ?? "");
  await db.testimonial.delete({ where: { id } }).catch(() => null);
  await audit(session, "Testimonial", id, "deleted");
  revalidateContent();
}

// -------------------------------------------------------------------- faq

const FaqGroupSchema = z.object({
  heading: z.string().min(2, "Group heading"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createFaqGroup(formData: FormData) {
  const session = await requireOwner();
  const parsed = FaqGroupSchema.safeParse({
    heading: formData.get("heading"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return;

  const g = await db.faqGroup.create({
    data: { ...parsed.data, active: true, items: [] },
  });
  await audit(session, "FaqGroup", g.id, "created", parsed.data.heading);
  revalidateContent();
}

export async function updateFaqGroup(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("groupId") ?? "");
  const heading = String(formData.get("heading") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  if (!id || !heading) return;

  // Questions arrive as parallel faq-q-0 / faq-a-0 fields. A blank question
  // drops that row, and the form always renders a few spare blanks.
  const items: { question: string; answer: string }[] = [];
  for (let i = 0; formData.has(`faq-q-${i}`); i += 1) {
    const question = String(formData.get(`faq-q-${i}`) ?? "").trim();
    const answer = String(formData.get(`faq-a-${i}`) ?? "").trim();
    if (question && answer) items.push({ question, answer });
  }

  await db.faqGroup.update({ where: { id }, data: { heading, sortOrder, items } });
  await audit(session, "FaqGroup", id, "updated", `${items.length} questions`);
  revalidateContent();
}

export async function toggleFaqGroup(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("groupId") ?? "");
  const g = await db.faqGroup.findUnique({ where: { id } });
  if (!g) return;

  await db.faqGroup.update({ where: { id }, data: { active: !g.active } });
  await audit(session, "FaqGroup", id, g.active ? "hidden" : "shown");
  revalidateContent();
}

export async function deleteFaqGroup(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("groupId") ?? "");
  await db.faqGroup.delete({ where: { id } }).catch(() => null);
  await audit(session, "FaqGroup", id, "deleted");
  revalidateContent();
}

// --------------------------------------------------------- story chapters

const ChapterSchema = z.object({
  eyebrow: z.string().min(1, "One-word label"),
  title: z.string().min(4, "Title"),
  accent: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createStoryChapter(formData: FormData) {
  const session = await requireOwner();
  const parsed = ChapterSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    accent: formData.get("accent") || "var(--color-fruit-carrot)",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return;

  const body = String(formData.get("body") ?? "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  let photo: string | null = null;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0 && !validateUpload(file)) {
    photo = (await storage.put(file, "story")).url;
  }

  const c = await db.storyChapter.create({
    data: { ...parsed.data, body, photo, active: true },
  });
  await audit(session, "StoryChapter", c.id, "created", parsed.data.title);
  revalidateContent();
}

export async function updateStoryChapter(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("chapterId") ?? "");
  const parsed = ChapterSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    accent: formData.get("accent") || "var(--color-fruit-carrot)",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!id || !parsed.success) return;

  const body = String(formData.get("body") ?? "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  await db.storyChapter.update({ where: { id }, data: { ...parsed.data, body } });
  await audit(session, "StoryChapter", id, "updated");
  revalidateContent();
}

export async function uploadStoryChapterPhoto(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("chapterId") ?? "");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return;
  if (validateUpload(file)) return;

  const chapter = await db.storyChapter.findUnique({ where: { id } });
  if (!chapter) return;

  const { url } = await storage.put(file, "story");
  await deleteLocalUpload(chapter.photo);
  await db.storyChapter.update({ where: { id }, data: { photo: url } });

  await audit(session, "StoryChapter", id, "photo replaced");
  revalidateContent();
}

export async function toggleStoryChapter(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("chapterId") ?? "");
  const c = await db.storyChapter.findUnique({ where: { id } });
  if (!c) return;

  await db.storyChapter.update({ where: { id }, data: { active: !c.active } });
  await audit(session, "StoryChapter", id, c.active ? "hidden" : "shown");
  revalidateContent();
}

export async function deleteStoryChapter(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("chapterId") ?? "");
  const c = await db.storyChapter.findUnique({ where: { id } });
  if (c) await deleteLocalUpload(c.photo);
  await db.storyChapter.delete({ where: { id } }).catch(() => null);
  await audit(session, "StoryChapter", id, "deleted");
  revalidateContent();
}

// -------------------------------------------------------------- gift tiers

const GiftTierSchema = z.object({
  name: z.string().min(2, "Name"),
  bottles: z.coerce.number().int().min(1).max(100),
  price: z.coerce.number().int().min(0),
  blurb: z.string().max(200),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createGiftTier(formData: FormData) {
  const session = await requireOwner();
  const parsed = GiftTierSchema.safeParse({
    name: formData.get("name"),
    bottles: formData.get("bottles"),
    price: formData.get("price"),
    blurb: formData.get("blurb") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return;

  const slug = `box-of-${parsed.data.bottles}-${Date.now().toString(36)}`;
  const t = await db.giftTier.create({ data: { ...parsed.data, slug, active: true } });
  await audit(session, "GiftTier", t.id, "created", parsed.data.name);
  revalidateContent();
}

export async function updateGiftTier(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("tierId") ?? "");
  const parsed = GiftTierSchema.safeParse({
    name: formData.get("name"),
    bottles: formData.get("bottles"),
    price: formData.get("price"),
    blurb: formData.get("blurb") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!id || !parsed.success) return;

  await db.giftTier.update({ where: { id }, data: parsed.data });
  await audit(session, "GiftTier", id, "updated", `Rs ${parsed.data.price}`);
  revalidateContent();
}

export async function toggleGiftTier(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("tierId") ?? "");
  const t = await db.giftTier.findUnique({ where: { id } });
  if (!t) return;

  await db.giftTier.update({ where: { id }, data: { active: !t.active } });
  await audit(session, "GiftTier", id, t.active ? "hidden" : "shown");
  revalidateContent();
}

export async function deleteGiftTier(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("tierId") ?? "");
  await db.giftTier.delete({ where: { id } }).catch(() => null);
  await audit(session, "GiftTier", id, "deleted");
  revalidateContent();
}

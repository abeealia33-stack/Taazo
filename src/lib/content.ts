import { db } from "./db";

/**
 * Editorial content, read from the database.
 *
 * Mirrors src/lib/catalog.ts: the storefront reads through these functions,
 * never the old hardcoded arrays, so an edit in admin reaches the site.
 */

export async function getTestimonials() {
  return db.testimonial.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFaqGroups() {
  return db.faqGroup.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getStoryChapters() {
  return db.storyChapter.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getGiftTiers() {
  return db.giftTier.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

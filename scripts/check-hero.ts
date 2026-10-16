/** Pure content-contract checks; no database or production credentials needed. */
import assert from "node:assert/strict";
import { defaultHomepageContent, homepageSchema, MAX_HERO_SLIDES } from "../src/lib/homepage-schema";

const defaults = defaultHomepageContent();
assert(homepageSchema.safeParse(defaults).success);
const legacy = JSON.parse(JSON.stringify(defaults));
delete legacy.hero;
legacy.images.hero = { url: "/chulimaar/brand/share-headline.png", alt: "Existing hero", caption: "Original caption", position: "right" };
const upgraded = homepageSchema.parse(legacy);
assert.deepEqual(upgraded.hero.slides, [{ id: "legacy-hero", url: legacy.images.hero.url, alt: "Existing hero", position: "right", mobilePosition: "right", enabled: true }]);
assert.deepEqual(upgraded.text, defaults.text);
assert.deepEqual(upgraded.images, legacy.images);
assert.deepEqual(upgraded.faqs, defaults.faqs);
assert.deepEqual(homepageSchema.parse(JSON.parse(JSON.stringify(upgraded))), upgraded, "Migration must be stable after save/reload.");
legacy.images.hero.url = "";
assert.equal(homepageSchema.parse(legacy).hero.slides.length, 0);
const content = structuredClone(upgraded);
content.hero.slides = Array.from({ length: MAX_HERO_SLIDES }, (_, index) => ({ ...upgraded.hero.slides[0], id: `slide-${index}`, enabled: index === 0 }));
assert(homepageSchema.safeParse(content).success);
content.hero.slides.push({ ...content.hero.slides[0], id: "overflow" });
assert(!homepageSchema.safeParse(content).success, "Limit the number of slides.");
content.hero.slides.pop();
content.hero.slides[1].id = content.hero.slides[0].id;
assert(!homepageSchema.safeParse(content).success, "Reject duplicate IDs.");
content.hero.slides[1].id = "slide-1";
content.hero.slides[0].enabled = false;
assert(!homepageSchema.safeParse(content).success, "Require an enabled slide when images are configured.");
content.hero.slides[0].enabled = true;
content.hero.slides[0].alt = " ";
assert(!homepageSchema.safeParse(content).success, "Require meaningful image descriptions.");
content.hero.slides[0].alt = "Apricot orchard";
for (const url of ["javascript:alert(1)", "https://untrusted.example/photo.png", "/chulimaar/../private.png", ""]) {
  content.hero.slides[0].url = url;
  assert(!homepageSchema.safeParse(content).success, "Restrict public image URLs.");
}
content.hero.slides[0].url = `/media/chulimaar/${"a".repeat(64)}.webp`;
assert(homepageSchema.safeParse(content).success);
for (const interval of [3, 11, 5.5]) { content.hero.interval = interval; assert(!homepageSchema.safeParse(content).success); }
content.hero.interval = 6;
content.hero.slides.reverse();
assert.deepEqual(homepageSchema.parse(content).hero.slides.map(slide => slide.id), content.hero.slides.map(slide => slide.id), "Preserve slide order and hidden slides.");
console.log("Passed: legacy migration, content preservation, stable round-trip, empty fallback, six-slide limit, unique IDs, enabled slides, alt text, image URLs, duration bounds and ordering.");

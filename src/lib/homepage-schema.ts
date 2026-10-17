import { z } from "zod";
import { DEFAULT_PRODUCT_IMAGE } from "./product-views";
export { DEFAULT_PRODUCT_IMAGE } from "./product-views";

export const HOMEPAGE_KEY = "chulimaar.homepage.v1";
export const CONTENT_SECTIONS = ["Header", "Hero", "Product", "Process", "Founder", "Launch signup", "FAQs", "Footer"] as const;

export const TEXT_FIELDS = [
  { key: "navOil", section: "Header", label: "Oil navigation label", value: "Our Oil" },
  { key: "navProcess", section: "Header", label: "Process navigation label", value: "Our Process" },
  { key: "navStory", section: "Header", label: "Story navigation label", value: "Our Story" },
  { key: "navFaq", section: "Header", label: "FAQ navigation label", value: "FAQs" },
  { key: "launchCta", section: "Header", label: "Launch button label", value: "Get Launch Updates" },
  { key: "heroEyebrow", section: "Hero", label: "Status line", value: "Preparing our first batch" },
  { key: "heroTitle", section: "Hero", label: "Headline — first line", value: "Rooted in Skardu." },
  { key: "heroTitleEm", section: "Hero", label: "Headline — italic line", value: "Pressed in Skardu." },
  { key: "heroLead", section: "Hero", label: "Product introduction", value: "Apricot kernel oil for cooking." },
  { key: "heroBody", section: "Hero", label: "Supporting paragraph", value: "I'm preparing to press our first batch personally in Skardu, where I'm from. One product for your kitchen, built from our roots.", long: true },
  { key: "founderCta", section: "Hero", label: "Founder button label", value: "Meet the Founder" },
  { key: "stripOne", section: "Hero", label: "Bottom strip — first message", value: "One product. A personal beginning." },
  { key: "stripTwo", section: "Hero", label: "Bottom strip — second message", value: "From our roots to your kitchen." },
  { key: "stripThree", section: "Hero", label: "Bottom strip — location", value: "Chulimaar · Skardu" },
  { key: "oilEyebrow", section: "Product", label: "Section label", value: "Meet our first product" },
  { key: "oilTitle", section: "Product", label: "Heading — first line", value: "Apricot kernel oil," },
  { key: "oilTitleEm", section: "Product", label: "Heading — italic line", value: "for your kitchen." },
  { key: "oilBody", section: "Product", label: "Introduction", value: "We're beginning with one oil and a focus on cooking. We'll share the details as our preparation takes shape.", long: true },
  { key: "focusLabel", section: "Product", label: "First fact label", value: "Our focus" },
  { key: "focusValue", section: "Product", label: "First fact value", value: "Cooking" },
  { key: "productionLabel", section: "Product", label: "Second fact label", value: "Planned production" },
  { key: "productionValue", section: "Product", label: "Second fact value", value: "Skardu, Pakistan" },
  { key: "availabilityLabel", section: "Product", label: "Third fact label", value: "Availability" },
  { key: "availabilityValue", section: "Product", label: "Third fact value", value: "Preparing for launch" },
  { key: "oilNote", section: "Product", label: "Product details note", value: "Ingredients, extraction details and bottle sizes will be shared once confirmed.", long: true },
  { key: "processEyebrow", section: "Process", label: "Section label", value: "Our process, taking shape" },
  { key: "processTitle", section: "Process", label: "Heading", value: "From kernel" },
  { key: "processTitleEm", section: "Process", label: "Italic heading", value: "to bottle." },
  { key: "processIntro", section: "Process", label: "Introduction", value: "Three stages. Personally prepared.\nWe'll share the work as it happens.", long: true },
  { key: "kernelsTitle", section: "Process", label: "Stage 1 title", value: "The kernels" },
  { key: "kernelsBody", section: "Process", label: "Stage 1 description", value: "We're preparing our kernel sourcing and selection. We'll share their origin and preparation once confirmed.", long: true },
  { key: "pressingTitle", section: "Process", label: "Stage 2 title", value: "The pressing" },
  { key: "pressingBody", section: "Process", label: "Stage 2 description", value: "We plan to press the oil ourselves in Skardu, documenting our equipment and extraction method as we begin.", long: true },
  { key: "bottleTitle", section: "Process", label: "Stage 3 title", value: "The finished bottle" },
  { key: "bottleBody", section: "Process", label: "Stage 3 description", value: "Our bottle and label are being finalised. We'll share how the oil is finished, bottled and identified before launch.", long: true },
  { key: "founderEyebrow", section: "Founder", label: "Section label", value: "The person behind Chulimaar" },
  { key: "founderTitle", section: "Founder", label: "Heading — first line", value: "A name from our language." },
  { key: "founderTitleEm", section: "Founder", label: "Heading — italic line", value: "A business from our roots." },
  { key: "founderQuote", section: "Founder", label: "Personal quote", value: "“I'm from Skardu. Chulimaar is the Balti name we use for apricot oil.”", long: true },
  { key: "founderBody", section: "Founder", label: "Founder story", value: "I'm starting with one product and preparing to press the oil myself, building a business connected to my language and home.", long: true },
  { key: "founderName", section: "Founder", label: "Founder name / signature", value: "The founder of Chulimaar" },
  { key: "founderLocation", section: "Founder", label: "Location", value: "Skardu, Pakistan" },
  { key: "launchEyebrow", section: "Launch signup", label: "Section label", value: "From our kitchen to yours" },
  { key: "launchTitle", section: "Launch signup", label: "Heading — first line", value: "Be first to hear about" },
  { key: "launchTitleEm", section: "Launch signup", label: "Heading — italic line", value: "our first batch." },
  { key: "launchBody", section: "Launch signup", label: "Introduction", value: "Leave your email for Chulimaar launch updates. We'll be in touch when our oil is ready and ordering details are confirmed.", long: true },
  { key: "submitLabel", section: "Launch signup", label: "Submit button label", value: "Notify Me at Launch" },
  { key: "successTitle", section: "Launch signup", label: "Success heading", value: "You're on the list." },
  { key: "successBody", section: "Launch signup", label: "Success message", value: "We'll email you when our first batch is ready and orders open.", long: true },
  { key: "faqEyebrow", section: "FAQs", label: "Section label", value: "A few things you may be wondering" },
  { key: "faqTitle", section: "FAQs", label: "Heading", value: "Before" },
  { key: "faqTitleEm", section: "FAQs", label: "Italic heading", value: "we begin." },
  { key: "faqBody", section: "FAQs", label: "Introduction", value: "What we know now, and what we'll share as our first batch comes together.", long: true },
  { key: "footerDescription", section: "Footer", label: "Brand description", value: "Apricot kernel oil for your kitchen.\nA personal beginning in Skardu.", long: true },
  { key: "footerLaunchLabel", section: "Footer", label: "CTA column label", value: "Launch updates" },
  { key: "footerCta", section: "Footer", label: "Launch link label", value: "Get launch updates" },
  { key: "footerCopyright", section: "Footer", label: "Copyright name and location", value: "Chulimaar · Skardu, Pakistan" },
  { key: "footerNote", section: "Footer", label: "Bottom row note", value: "Made with roots in mind." },
] as const;
export type TextKey = typeof TEXT_FIELDS[number]["key"];
export type HomepageText = Record<TextKey, string>;
export function homepageLinks(text: HomepageText) {
  return [{ label: text.navOil, href: "/#our-oil" }, { label: text.navProcess, href: "/#our-process" }, { label: text.navStory, href: "/#our-story" }, { label: text.navFaq, href: "/#faqs" }];
}
export const PHOTO_FIELDS = [
  { key: "hero", section: "Hero", label: "Hero banner", alt: "Apricots and kernels for Chulimaar", caption: "Apricots, close to home", size: "1800 × 1800px · square", ratio: "1 / 1", guidance: "Real apricots, kernels or a Skardu orchard in natural daylight. Shown beside the main headline." },
  { key: "founder", section: "Founder", label: "Founder portrait", alt: "The founder of Chulimaar in Skardu", caption: "The founder", size: "1200 × 1500px · portrait", ratio: "4 / 5", guidance: "You in Skardu, ideally working with apricots or kernels. Shown beside your personal story." },
  { key: "oil", section: "Product", label: "Product photograph", alt: "Chulimaar apricot kernel oil bottle with a wooden cap and cream label", caption: "Our first product", size: "1024 × 1536px · portrait", ratio: "2 / 3", guidance: "Show the whole bottle, including its cap and base. The product display fits your photograph without cropping it." },
  { key: "kernels", section: "Process", label: "Kernel photograph", alt: "Apricot kernels being prepared", caption: "The kernels", size: "1600 × 1200px · landscape", ratio: "4 / 3", guidance: "A close-up of real apricot kernels. Shown above the first process step." },
  { key: "pressing", section: "Process", label: "Pressing photograph", alt: "Oil pressing equipment in Skardu", caption: "The pressing", size: "1600 × 1200px · landscape", ratio: "4 / 3", guidance: "Your pressing equipment or the pressing work in progress. Shown above the second process step." },
  { key: "bottle", section: "Process", label: "Bottling photograph", alt: "The bottling process", caption: "The finished bottle", size: "1600 × 1200px · landscape", ratio: "4 / 3", guidance: "Your actual bottling setup or finished batch, once ready. Shown above the third process step." },
] as const;
export type PhotoKey = typeof PHOTO_FIELDS[number]["key"];
export const PHOTO_POSITIONS = ["center", "top", "bottom", "left", "right"] as const;

export function validPhotoUrl(value: string) {
  if (!value) return true;
  if (/^\/media\/chulimaar\/[a-f0-9]{64}\.webp$/.test(value)) return true;
  if (/^\/(?:uploads\/chulimaar|chulimaar)\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|avif)$/i.test(value) && !value.includes("..")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") && !url.username && !url.password; } catch { return false; }
}
const photoSchema = z.object({
  url: z.string().max(1000).refine(validPhotoUrl, "Use an uploaded Chulimaar image or a local /chulimaar/ image path."),
  alt: z.string().trim().max(300), caption: z.string().trim().max(160), position: z.enum(PHOTO_POSITIONS),
}).refine((photo) => !photo.url || photo.alt.length > 0, { message: "Describe this image for visitors using screen readers.", path: ["alt"] });

export const MAX_HERO_SLIDES = 6;
const heroSlideSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/, "Invalid slide ID."),
  url: z.string().min(1, "Upload an image for this slide.").max(1000).refine(validPhotoUrl, "Use an uploaded Chulimaar image."),
  alt: z.string().trim().min(1, "Describe this image for visitors using screen readers.").max(300),
  position: z.enum(PHOTO_POSITIONS), mobilePosition: z.enum(PHOTO_POSITIONS), enabled: z.boolean(),
});
const heroSchema = z.object({
  slides: z.array(heroSlideSchema).max(MAX_HERO_SLIDES), autoplay: z.boolean(), interval: z.number().int().min(4).max(10),
}).superRefine((hero, context) => {
  if (new Set(hero.slides.map(slide => slide.id)).size !== hero.slides.length) context.addIssue({ code: "custom", message: "Each slide must have a unique ID.", path: ["slides"] });
  if (hero.slides.length && !hero.slides.some(slide => slide.enabled)) context.addIssue({ code: "custom", message: "Enable at least one slide, or remove all slides to use the branded background.", path: ["slides"] });
});
export type HeroSlideshow = z.infer<typeof heroSchema>;
export type HeroSlide = HeroSlideshow["slides"][number];

// Old saved pages keep their image, text and revision. Migration is read-only
// until the owner explicitly saves the editor.
export const homepageSchema = z.preprocess((input) => {
  if (!input || typeof input !== "object") return input;
  const legacy = input as { images?: { hero?: { url?: string; alt?: string; position?: string }; oil?: Record<string, unknown> } };
  const image = legacy.images?.hero;
  const result: Record<string, unknown> = { ...input };
  // Upgrade our bundled photograph only; owner uploads stay untouched.
  if (legacy.images?.oil?.url === "/chulimaar/product/apricot-kernel-oil.png") result.images = { ...legacy.images, oil: { ...legacy.images.oil, url: DEFAULT_PRODUCT_IMAGE } };
  if (!("hero" in input)) result.hero = { autoplay: true, interval: 6, slides: image?.url ? [{ id: "legacy-hero", url: image.url, alt: image.alt, position: image.position, mobilePosition: image.position, enabled: true }] : [] };
  if (!("product" in input)) {
    result.product = { animation: true };
    // Adopt the supplied bottle only for an old empty product slot. Once the
    // owner saves the new settings, an intentional image removal stays empty.
    if (legacy.images?.oil?.url === "") result.images = { ...legacy.images, oil: { ...legacy.images.oil, url: DEFAULT_PRODUCT_IMAGE, alt: PHOTO_FIELDS.find(field => field.key === "oil")!.alt } };
  }
  return result;
}, z.object({
  version: z.literal(1),
  text: z.object(Object.fromEntries(TEXT_FIELDS.map((field) => [field.key, z.string().trim().min(1, "This text is required.").max("long" in field ? 2000 : 180)])) as Record<TextKey, z.ZodString>),
  images: z.object(Object.fromEntries(PHOTO_FIELDS.map((field) => [field.key, photoSchema])) as Record<PhotoKey, typeof photoSchema>),
  hero: heroSchema,
  product: z.object({ animation: z.boolean() }),
  faqs: z.array(z.object({ question: z.string().trim().min(1, "Enter a question.").max(200), answer: z.string().trim().min(1, "Enter an answer.").max(2000) })).min(1).max(20),
  contact: z.object({
    email: z.union([z.literal(""), z.string().trim().email()]),
    instagram: z.union([z.literal(""), z.string().url().refine((value) => { try { const url = new URL(value); return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && !url.username && !url.password; } catch { return false; } }, "Use an https://instagram.com/ profile link.")]),
    whatsapp: z.string().regex(/^\d{7,15}$|^$/, "Use 7–15 digits in international format, without + or spaces."),
  }),
}));
export type HomepageContent = z.infer<typeof homepageSchema>;

export function defaultHomepageContent(): HomepageContent {
  return {
    version: 1,
    hero: { slides: [], autoplay: true, interval: 6 },
    product: { animation: true },
    text: Object.fromEntries(TEXT_FIELDS.map((field) => [field.key, field.value])) as HomepageText,
    images: Object.fromEntries(PHOTO_FIELDS.map((field) => [field.key, { url: field.key === "oil" ? DEFAULT_PRODUCT_IMAGE : "", alt: field.alt, caption: field.caption, position: "center" }])) as HomepageContent["images"],
    faqs: [
      { question: "What does Chulimaar mean?", answer: "Chulimaar is the Balti name we use for apricot oil. It connects this business to our language and roots in Skardu." },
      { question: "Where will the oil be pressed?", answer: "We plan to press the oil ourselves in Skardu, where our founder is from and is preparing the first batch." },
      { question: "What culinary uses is it intended for?", answer: "Cooking is the primary purpose of our first product. We'll share specific culinary uses once the product specifications are confirmed." },
      { question: "When will orders open?", answer: "We're preparing our first batch and haven't announced an opening date yet. Sign up for launch updates to hear when the oil is ready and orders open." },
      { question: "Where will delivery be available?", answer: "Delivery areas and ordering arrangements are being finalised. We'll announce them before orders open." },
    ], contact: { email: "", instagram: "", whatsapp: "" },
  };
}

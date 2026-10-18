/** Confirmed pre-launch copy. Fill optional assets and channels when approved. */
export const CHULIMAAR = {
  name: "Chulimaar",
  siteUrl: new URL(process.env.CHULIMAAR_SITE_URL || "https://deepskyblue-dove-264491.hostingersite.com").origin,
  email: process.env.CHULIMAAR_CONTACT_EMAIL || null,
  instagram: process.env.CHULIMAAR_INSTAGRAM_URL || null,
  whatsapp: process.env.CHULIMAAR_WHATSAPP || null,
  heroPhotoAlt: process.env.CHULIMAAR_HERO_PHOTO_ALT || "Apricots and kernels for Chulimaar",
  photos: {
    hero: process.env.CHULIMAAR_HERO_PHOTO || null,
    oil: process.env.CHULIMAAR_OIL_PHOTO || null,
    kernels: process.env.CHULIMAAR_KERNELS_PHOTO || null,
    pressing: process.env.CHULIMAAR_PRESSING_PHOTO || null,
    bottle: process.env.CHULIMAAR_BOTTLE_PHOTO || null,
    founder: process.env.CHULIMAAR_FOUNDER_PHOTO || null,
  },
} as const;

/** Enabling sales requires a separate commerce release. */
export const PRELAUNCH = true;
export const PRELAUNCH_LINKS = [
  { label: "Our Oil", href: "/#our-oil" },
  { label: "Our Process", href: "/#our-process" },
  { label: "Our Story", href: "/#our-story" },
  { label: "FAQs", href: "/#faqs" },
];

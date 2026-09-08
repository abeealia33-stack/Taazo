/**
 * Site-wide constants.
 *
 * Anything read from a Setting row in the database at runtime falls back to
 * these, so the site is never broken while the admin panel is empty.
 *
 * NOT-YET-SET CHANNELS ARE `null`, NOT A PLAUSIBLE GUESS.
 *
 * A made-up address like hello@taazo.pk looks configured, renders as a real
 * link, and quietly loses every message sent to it. Null lets the UI say
 * "coming soon" instead of sending someone somewhere that does not exist.
 * Fill one in and it becomes a live link everywhere, with no other change.
 */
type SiteConfig = {
  name: string;
  tagline: string;
  city: string;
  whatsapp: string;
  phoneDisplay: string;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  sameDayCutoffHour: number;
};

export const SITE: SiteConfig = {
  name: "taazo.",
  tagline: "pressed this morning, bottled by noon",
  city: "Lahore",

  /** International format, no + or spaces. */
  whatsapp: "923124433199",
  phoneDisplay: "0312 4433199",

  /** ⚠ Set these when the accounts exist. Until then the UI says so. */
  email: null,
  instagram: null,
  facebook: null,

  /** Same-day orders close at this hour, Asia/Karachi. Overridable in admin. */
  sameDayCutoffHour: 13,
};

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp is always available, so it is the fallback for everything else. */
export const CONTACT_FALLBACK = "WhatsApp";

/**
 * ⚠ ASSUMED PRODUCT DATA — Abee, this is the file to correct.
 *
 * Every name, price, size and description below is my best guess, derived from
 * the product photographs you shared. Nothing here came from you. Correct the
 * values in this one file and the whole site updates: cards, product pages,
 * cart, checkout, admin seed and structured data all read from here.
 *
 * Once the admin panel is populated, the database becomes the source of truth
 * and this file is used only to seed it.
 */

export type Category = "juice" | "jars" | "tea" | "gifting";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  /** Millilitres for drinks; grams for jars. */
  size: string;
  /** Whole rupees. */
  price: number;
  /** Sampled from the product's own photograph. */
  accent: string;
  ingredients: string[];
  nutrition: { label: string; value: string }[];
  /** Real photo path once dropped into /public/photos. Null → designed placeholder. */
  photo: string | null;
  featured: boolean;
  sortOrder: number;
};

export const PRODUCTS: Product[] = [
  {
    slug: "carrot-orange",
    name: "Carrot & Orange",
    tagline: "the everyday one",
    description:
      "Sweet carrots and winter oranges, cold-pressed together the morning you drink them. Nothing added — no water, no sugar, no concentrate. The colour you see in the bottle is the colour it came out of the press.",
    category: "juice",
    size: "350 ml",
    price: 380,
    accent: "var(--color-fruit-carrot)",
    ingredients: ["Carrot", "Orange", "A squeeze of lemon"],
    nutrition: [
      { label: "Serving", value: "350 ml" },
      { label: "Added sugar", value: "None" },
      { label: "Ingredients", value: "Fruit and vegetables only" },
      { label: "Best before", value: "3 days, refrigerated" },
    ],
    photo: null,
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "peach-iced-tea",
    name: "Peach Iced Tea",
    tagline: "brewed, not bottled from syrup",
    description:
      "Loose-leaf black tea brewed slowly, cooled, then finished with real peach. Lightly sweetened and nothing like the sugar water that usually carries this name.",
    category: "tea",
    size: "350 ml",
    price: 320,
    accent: "var(--color-fruit-peach)",
    ingredients: ["Black tea", "Peach", "A little honey"],
    nutrition: [
      { label: "Serving", value: "350 ml" },
      { label: "Sweetener", value: "Honey, lightly" },
      { label: "Caffeine", value: "Yes — black tea" },
      { label: "Best before", value: "4 days, refrigerated" },
    ],
    photo: null,
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "dragonfruit-mango-jar",
    name: "Dragonfruit & Mango Jar",
    tagline: "cut this morning",
    description:
      "Dragonfruit, mango, kiwi and watermelon, cut by hand and layered into the jar. No syrup, no preservative — just fruit, cold. Eat it with a fork straight from the jar.",
    category: "jars",
    size: "450 g",
    price: 520,
    accent: "var(--color-fruit-dragon)",
    ingredients: ["Dragonfruit", "Mango", "Kiwi", "Watermelon"],
    nutrition: [
      { label: "Serving", value: "450 g" },
      { label: "Added sugar", value: "None" },
      { label: "Preservatives", value: "None" },
      { label: "Best before", value: "2 days, refrigerated" },
    ],
    photo: null,
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "strawberry-kiwi-jar",
    name: "Strawberry & Kiwi Jar",
    tagline: "the tart one",
    description:
      "Strawberries and kiwi with pineapple to round it out. Sharper than the mango jar, and the one people come back for in strawberry season.",
    category: "jars",
    size: "450 g",
    price: 490,
    accent: "var(--color-fruit-kiwi)",
    ingredients: ["Strawberry", "Kiwi", "Pineapple", "Mango"],
    nutrition: [
      { label: "Serving", value: "450 g" },
      { label: "Added sugar", value: "None" },
      { label: "Preservatives", value: "None" },
      { label: "Best before", value: "2 days, refrigerated" },
    ],
    photo: null,
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "mango-pineapple-jar",
    name: "Mango & Pineapple Jar",
    tagline: "summer, in a jar",
    description:
      "Ripe mango and pineapple with a little kiwi. The sweetest jar we make, and the one that disappears fastest in June.",
    category: "jars",
    size: "450 g",
    price: 490,
    accent: "var(--color-fruit-mango)",
    ingredients: ["Mango", "Pineapple", "Kiwi"],
    nutrition: [
      { label: "Serving", value: "450 g" },
      { label: "Added sugar", value: "None" },
      { label: "Preservatives", value: "None" },
      { label: "Best before", value: "2 days, refrigerated" },
    ],
    photo: null,
    featured: false,
    sortOrder: 5,
  },
  {
    slug: "berry-mix-jar",
    name: "Berry Mix Jar",
    tagline: "strawberry, blueberry, mango",
    description:
      "Strawberries and blueberries over mango. The jar we send most often as a gift, because it looks like something worth giving.",
    category: "jars",
    size: "450 g",
    price: 560,
    accent: "var(--color-fruit-melon)",
    ingredients: ["Strawberry", "Blueberry", "Mango"],
    nutrition: [
      { label: "Serving", value: "450 g" },
      { label: "Added sugar", value: "None" },
      { label: "Preservatives", value: "None" },
      { label: "Best before", value: "2 days, refrigerated" },
    ],
    photo: null,
    featured: true,
    sortOrder: 6,
  },
];

/** @deprecated moved to the database — see src/lib/content.ts getGiftTiers() */

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  juice: "cold-pressed juice",
  jars: "fresh fruit jars",
  tea: "iced tea",
  gifting: "gifting boxes",
};

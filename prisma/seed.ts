/**
 * Seeds the database with the assumed catalogue, delivery zones, today's batch
 * and one admin user, so the site and the admin panel are usable immediately.
 *
 * Safe to re-run: everything is upserted by a natural key.
 *
 *   npm run db:seed
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";
import { PRODUCTS } from "../src/data/products";

const db = new PrismaClient();

const ADMIN_EMAIL = "abeealia33@gmail.com";
const ADMIN_PASSWORD = "taazo-admin"; // ⚠ change on first login

/** ⚠ ASSUMED — Lahore areas, fees and minimums are guesses. */
const ZONES = [
  {
    name: "Central Lahore",
    areas: ["Gulberg", "Model Town", "Garden Town", "Faisal Town"],
    fee: 150,
    minOrder: 0,
    sortOrder: 1,
  },
  {
    name: "DHA & Cantt",
    areas: ["DHA Phase 1-8", "Cantt", "Askari"],
    fee: 200,
    minOrder: 0,
    sortOrder: 2,
  },
  {
    name: "Johar Town & Wapda",
    areas: ["Johar Town", "Wapda Town", "Valencia", "Township"],
    fee: 200,
    minOrder: 0,
    sortOrder: 3,
  },
  {
    name: "Bahria & Raiwind Road",
    areas: ["Bahria Town", "Raiwind Road", "Lake City"],
    fee: 300,
    minOrder: 1500,
    sortOrder: 4,
  },
  {
    name: "Old City & North",
    areas: ["Shadman", "Samanabad", "Iqbal Town", "Shahdara"],
    fee: 200,
    minOrder: 0,
    sortOrder: 5,
  },
];

function todayBatchCode() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
  );
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-A`;
}

/**
 * Prisma implements upsert on MongoDB with a transaction, which a standalone
 * server rejects. Read-then-write is equivalent here: the seed is the only
 * writer, so there is no race to lose.
 */
async function upsertBy<T>(
  find: () => Promise<T | null>,
  create: () => Promise<T>,
  update: (existing: T) => Promise<T>,
) {
  const existing = await find();
  return existing ? update(existing) : create();
}

async function main() {
  console.log("seeding taazo…");

  // ---- categories ----
  const CATEGORIES = [
    { slug: "juice", name: "Cold-pressed juice", description: "Pressed at dawn, no concentrate.", sortOrder: 1 },
    { slug: "jars", name: "Fresh fruit jars", description: "Cut by hand this morning.", sortOrder: 2 },
    { slug: "tea", name: "Iced tea", description: "Brewed slowly, not from syrup.", sortOrder: 3 },
    { slug: "gifting", name: "Gifting", description: "Boxes packed on ice.", sortOrder: 4 },
  ];
  for (const c of CATEGORIES) {
    await upsertBy(
      () => db.category.findUnique({ where: { slug: c.slug } }),
      () => db.category.create({ data: { ...c, active: true } }),
      (existing) =>
        db.category.update({
          where: { id: existing.id },
          data: { name: c.name, description: c.description, sortOrder: c.sortOrder },
        }),
    );
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  // ---- products ----
  for (const p of PRODUCTS) {
    await upsertBy(
      () => db.product.findUnique({ where: { slug: p.slug } }),
      () =>
        db.product.create({
          data: {
            slug: p.slug,
            name: p.name,
            tagline: p.tagline,
            description: p.description,
            category: p.category,
            size: p.size,
            price: p.price,
            accent: p.accent,
            ingredients: p.ingredients,
            nutrition: p.nutrition,
            photos: p.photo ? [p.photo] : [],
            sortOrder: p.sortOrder,
            featured: p.featured,
            active: true,
          },
        }),
      (existing) =>
        db.product.update({
          where: { id: existing.id },
          data: {
            name: p.name,
            tagline: p.tagline,
            description: p.description,
            price: p.price,
            accent: p.accent,
            sortOrder: p.sortOrder,
            featured: p.featured,
          },
        }),
    );
  }
  console.log(`  ✓ ${PRODUCTS.length} products`);

  // ---- delivery zones ----
  for (const z of ZONES) {
    const existing = await db.deliveryZone.findFirst({ where: { name: z.name } });
    if (existing) {
      await db.deliveryZone.update({ where: { id: existing.id }, data: z });
    } else {
      await db.deliveryZone.create({ data: z });
    }
  }
  console.log(`  ✓ ${ZONES.length} delivery zones`);

  // ---- admin user ----
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await upsertBy(
    () => db.adminUser.findUnique({ where: { email: ADMIN_EMAIL } }),
    () =>
      db.adminUser.create({
        data: { name: "Abee", email: ADMIN_EMAIL, passwordHash, role: "owner" },
      }),
    async (existing) => existing,
  );
  console.log(`  ✓ admin user ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  // ---- today's batch, with stock ----
  const code = todayBatchCode();
  const pressedAt = new Date();
  pressedAt.setHours(6, 40, 0, 0);

  const stock = PRODUCTS.map((p) => ({
    productSlug: p.slug,
    bottlesMade: p.featured ? 24 : 16,
    available: p.featured ? 24 : 16,
    bottlesSold: 0,
    reserved: 0,
    unsold: 0,
    wasted: 0,
  }));

  await upsertBy(
    () => db.batch.findUnique({ where: { code } }),
    () =>
      db.batch.create({
        data: { code, pressedAt, city: "Lahore", status: "live", stock },
      }),
    (existing) =>
      db.batch.update({
        where: { id: existing.id },
        data: { status: "live" },
      }),
  );
  console.log(`  ✓ batch ${code} live with stock`);

  // ---- settings ----
  const settings: [string, unknown][] = [
    ["whatsappNumber", "923124433199"],
    ["sameDayCutoffHour", 13],
    ["freeDeliveryOver", 3000],
    ["bankDetails", {
      bank: "⚠ PLACEHOLDER Bank",
      accountTitle: "taazo",
      accountNumber: "PK00 XXXX 0000 0000 0000",
      jazzCash: "0300 000 0000",
    }],
    ["soldOutMode", false],
  ];
  for (const [key, value] of settings) {
    await upsertBy(
      () => db.setting.findUnique({ where: { key } }),
      () => db.setting.create({ data: { key, value: JSON.stringify(value) } }),
      async (existing) => existing,
    );
  }
  console.log(`  ✓ ${settings.length} settings`);

  // ---- sample orders, so the admin panel is not empty on first run ----
  // ⚠ Delete these before you go live: npm run db:clear-samples
  const zone = await db.deliveryZone.findFirst({ orderBy: { sortOrder: "asc" } });
  const samples = [
    {
      orderNumber: "TZ-SAMPLE-0001",
      status: "pending",
      customerName: "Ayesha Rahim",
      phone: "0300 1112233",
      area: zone?.name ?? "Central Lahore",
      slot: "morning",
      method: "cod",
      items: [{ slug: "carrot-orange", qty: 2 }, { slug: "berry-mix-jar", qty: 1 }],
    },
    {
      orderNumber: "TZ-SAMPLE-0002",
      status: "out_for_delivery",
      customerName: "Hamza Khan",
      phone: "0321 4445566",
      area: zone?.name ?? "Central Lahore",
      slot: "afternoon",
      method: "transfer",
      items: [{ slug: "peach-iced-tea", qty: 4 }],
    },
    {
      orderNumber: "TZ-SAMPLE-0003",
      status: "delivered",
      customerName: "Sara Malik",
      phone: "0333 7778899",
      area: zone?.name ?? "Central Lahore",
      slot: "evening",
      method: "cod",
      items: [{ slug: "dragonfruit-mango-jar", qty: 3 }],
    },
  ];

  for (const sample of samples) {
    const exists = await db.order.findUnique({
      where: { orderNumber: sample.orderNumber },
    });
    if (exists) continue;

    const items = sample.items.map((line) => {
      const p = PRODUCTS.find((x) => x.slug === line.slug)!;
      return {
        productSlug: p.slug,
        nameSnapshot: p.name,
        priceSnapshot: p.price,
        qty: line.qty,
        size: p.size,
        isGiftBox: false,
        giftItems: [],
      };
    });
    const subtotal = items.reduce((n, i) => n + i.priceSnapshot * i.qty, 0);
    const deliveryFee = subtotal >= 3000 ? 0 : (zone?.fee ?? 150);

    await db.order.create({
      data: {
        orderNumber: sample.orderNumber,
        status: sample.status,
        paymentMethod: sample.method,
        paymentStatus: sample.method === "cod" ? "pending" : "pending",
        customerName: sample.customerName,
        phone: sample.phone,
        addressLine: "House 12, Street 4",
        area: sample.area,
        city: "Lahore",
        zoneId: zone?.id ?? null,
        deliveryDate: new Date(),
        deliverySlot: sample.slot,
        items,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        batchCode: code,
        source: "web",
        notes: "Sample order created by the seed script — safe to delete.",
      },
    });
  }
  console.log(`  ✓ ${samples.length} sample orders (delete before launch)`);

  // ---- testimonials ----
  const TESTIMONIALS = [
    { quote: "Ordered the carrot and orange for the whole family. Gone in two days, and my mother now asks for it by name.", name: "Ayesha R.", city: "Lahore", accent: "var(--color-fruit-carrot)", sortOrder: 1 },
    { quote: "Sent a box of six to my in-laws for Eid. They called to ask where it came from, which never happens with mithai.", name: "Hamza K.", city: "Lahore", accent: "var(--color-fruit-dragon)", sortOrder: 2 },
    { quote: "We keep a standing order for the office on Mondays and Thursdays. It has quietly replaced the biscuit budget.", name: "Sara M.", city: "Lahore", accent: "var(--color-fruit-kiwi)", sortOrder: 3 },
  ];
  for (const t of TESTIMONIALS) {
    const exists = await db.testimonial.findFirst({ where: { name: t.name, quote: t.quote } });
    if (!exists) await db.testimonial.create({ data: { ...t, active: true } });
  }
  console.log(`  ✓ ${TESTIMONIALS.length} testimonials`);

  // ---- FAQ ----
  const FAQ_GROUPS = [
    {
      heading: "Freshness", sortOrder: 1,
      items: [
        { question: "How long does it keep?", answer: "Juice and iced tea, three to four days refrigerated. Fruit jars, two days. There are no preservatives in any of it, which is the reason for the short window and the reason it tastes the way it does." },
        { question: "Is there added sugar?", answer: "Not in the juice or the jars — nothing but fruit and vegetables. The peach iced tea is lightly sweetened with honey. Every product page lists exactly what is in it." },
        { question: "What does cold-pressed actually mean here?", answer: "The fruit is pressed without heat, so nothing is cooked and nothing is lost to pasteurisation. It also means the product has a short life, which is why we press each morning rather than in advance." },
        { question: "What is the batch code on my order?", answer: "The date and sequence of the batch your bottles came from, plus the time it was pressed. It is on your confirmation so you know exactly how old your juice is." },
      ],
    },
    {
      heading: "Delivery", sortOrder: 2,
      items: [
        { question: "When do you deliver?", answer: "Same day across Lahore for orders placed before the cutoff shown at checkout. Anything after that goes out the next morning with the next batch." },
        { question: "How much is delivery?", answer: "From Rs 150 depending on your area, and free on orders over Rs 3,000. The exact fee is shown before you pay, never after." },
        { question: "How is it kept cold?", answer: "Everything travels in an insulated box packed with ice. Gift boxes are packed on ice as standard, because they are usually opened in front of people." },
        { question: "My bottle arrived warm. What now?", answer: "Message us on WhatsApp with your order number and a photo, the same day. We replace it on the next delivery run, no argument." },
        { question: "Do you deliver outside Lahore?", answer: "Not yet for juice — the cold chain will not hold. Gift boxes to other cities are handled case by case, so ask us first." },
      ],
    },
    {
      heading: "Orders & payment", sortOrder: 3,
      items: [
        { question: "How do I pay?", answer: "Cash on delivery, or bank and JazzCash transfer with a screenshot of the receipt. Card payments are coming once our gateway is approved." },
        { question: "Do I need an account?", answer: "No. Checkout takes a name, a phone number and an address, and nothing else." },
        { question: "Can I order for a specific date?", answer: "Yes — gift boxes can be scheduled. Choose the delivery date while you build the box." },
        { question: "Can I change or cancel my order?", answer: "Until it is packed, yes. Message us on WhatsApp with your order number and we will sort it." },
      ],
    },
  ];
  for (const g of FAQ_GROUPS) {
    const exists = await db.faqGroup.findFirst({ where: { heading: g.heading } });
    if (!exists) {
      await db.faqGroup.create({
        data: { heading: g.heading, sortOrder: g.sortOrder, active: true, items: g.items },
      });
    }
  }
  console.log(`  ✓ ${FAQ_GROUPS.length} FAQ groups`);

  // ---- story chapters ----
  const STORY_CHAPTERS = [
    {
      eyebrow: "why", title: "Because most juice in Pakistan is not juice",
      body: [
        "Walk into any shop and the shelf is full of cartons that have never met a press. Concentrate, water, sugar, a picture of a fruit on the front. It keeps for nine months because there is very little in it that could go off.",
        "We wanted the opposite problem. Something so alive it has to be drunk within days, made from fruit picked close enough to Lahore that it is still heavy when it arrives.",
      ],
      accent: "var(--color-fruit-carrot)", sortOrder: 1,
    },
    {
      eyebrow: "where", title: "Punjab grows more than it gets credit for",
      body: [
        "Kinnow from Sargodha in winter. Mango from Multan when the heat arrives. Falsa for the six weeks it exists at all, guava in autumn, carrots that are sweet enough to press on their own.",
        "We buy what is good that morning rather than what is on a list. Some days that means a product is not available, and we would rather tell you that than press something mediocre.",
      ],
      accent: "var(--color-fruit-kiwi)", sortOrder: 2,
    },
    {
      eyebrow: "how", title: "Cold-pressed, in small batches, before the city wakes",
      body: [
        "Everything is washed, cut and pressed by hand between five and eight in the morning. No heat, which means no cooked flavour and nothing lost. No water, no concentrate, no preservative — which is exactly why it only lasts a few days.",
        "Every batch gets a code and a time. It is printed on your order confirmation, so you know precisely how old your bottle is. Nobody else in this category will tell you that.",
      ],
      accent: "var(--color-fruit-dragon)", sortOrder: 3,
    },
  ];
  for (const c of STORY_CHAPTERS) {
    const exists = await db.storyChapter.findFirst({ where: { title: c.title } });
    if (!exists) await db.storyChapter.create({ data: { ...c, photo: null, active: true } });
  }
  console.log(`  ✓ ${STORY_CHAPTERS.length} story chapters`);

  // ---- gift tiers ----
  const TIERS = [
    { slug: "box-of-four", name: "Box of four", bottles: 4, price: 1900, blurb: "For a small thank-you, or a household of two.", sortOrder: 1 },
    { slug: "box-of-six", name: "Box of six", bottles: 6, price: 2750, blurb: "The one most people send. Packed on ice, delivered cold.", sortOrder: 2 },
    { slug: "box-of-twelve", name: "Box of twelve", bottles: 12, price: 5200, blurb: "For weddings, Eid and the office pantry.", sortOrder: 3 },
  ];
  for (const t of TIERS) {
    const exists = await db.giftTier.findUnique({ where: { slug: t.slug } });
    if (!exists) await db.giftTier.create({ data: { ...t, active: true } });
  }
  console.log(`  ✓ ${TIERS.length} gift tiers`);

  console.log("done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

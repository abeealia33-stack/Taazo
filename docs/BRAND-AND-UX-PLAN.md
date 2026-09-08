# taazo. — Brand, UI & UX Plan

_Written 2026-09-06. Status: plan for review; implementation resumes 7:00 AM PKT._

---

## 0. Where the build actually stands

| Item | State |
|---|---|
| Next.js 16 + TypeScript + Tailwind v4 | scaffolded at repo root |
| GSAP 3.15, Lenis, Zustand, Zod, react-hook-form | installed |
| Brand tokens, wordmark, layout, pages | **not started** |
| Old static prototype | archived at `_incoming-photos/prototype.html.bak` |
| Real product photos | **not on disk** — drop into `_incoming-photos/` |

Blocking input still needed: the real SKU list with prices.

### Decisions locked

- **Wordmark: the rounded geometric sans** — the one on the carrot-juice bottle and the peach iced tea. It becomes the single wordmark everywhere: site logo, nav, footer, favicon, page-transition curtain, order emails, and any future packaging. It will be traced from the bottle photo and shipped as an SVG so it is pixel-identical at every size, never re-set in a live font.
- **Consequence for packaging:** the fresh-fruit jar labels and the six-bottle ice-box labels use the serif wordmark and are now off-brand. They need reprinting to match. Until they are reprinted, the site should lead with carrot-juice and iced-tea photography in hero and brand positions, and use the fruit-jar and ice-box shots where the label is small or out of focus — so the site never shows two competing wordmarks side by side.
- **Companion UI typeface:** a geometric sans in the same family of shapes (Poppins or Outfit) for headings and body, chosen at build time against the traced wordmark. The serif is retired entirely.

---

## 1. Strategist's read: what the direction gets right, and what it misses

**Right:** the gifting angle is a genuine wedge — Pakistani juice brands compete on "cold-pressed detox," and none own Eid, wedding and corporate gifting. The photography is above category standard. The freshness claim ("pressed this morning") is concrete rather than aspirational.

**The gap:** the site as currently planned is a *catalogue with nice animations*. That sells juice. It does not build a brand. A brand exists when a customer can answer three questions without being told: **why this and not the other one, what does buying it say about me, and why would I come back weekly rather than once.** Everything below adds the machinery for those three.

**The strategic risk to avoid:** fresh juice is a repeat-purchase category with a brutal unit economic — one-off orders lose money once delivery cost is counted. So the plan below is biased toward *frequency and basket size*, not first-time conversion.

---

## 2. What's missing — pages and sections

### Must have before launch

1. **Story / About.** Not a corporate page. The sourcing story: which orchards, which farmers, why Punjab, what cold-pressed actually means in your kitchen. This is the page that converts gifting buyers, who need to believe the brand is worth attaching their own name to.
2. **Gifting configurator.** Currently a static section. It should be an interactive build-your-box: size (4 / 6 / 12), pick the flavours, add a handwritten note card, choose the delivery date. This is the highest-value single thing to build — it turns your differentiator into an actual product.
3. **Corporate / bulk enquiry.** Separate from consumer gifting: office pantry subscriptions, wedding orders, Ramadan and Eid corporate gifting. Capture headcount, budget, date, delivery location.
4. **FAQ — freshness and delivery.** Shelf life, cold chain, delivery areas and timings, what happens if a bottle arrives warm. This removes the top three objections in the category.
5. **Contact, with a persistent WhatsApp button.** In Pakistan this converts better than any contact form.

### Should have soon

6. **Subscription — "the weekly batch."** Weekly or twice-weekly recurring delivery at a modest discount. The single biggest lever on lifetime value in this business, and almost no Pakistani juice brand executes it well.
7. **Journal — behind the batch.** Short posts from the pressing floor. Feeds SEO and gives your content-led marketing somewhere to live that isn't rented from Instagram.
8. **Order tracking.** Lookup by order number and phone. Cuts WhatsApp support load dramatically.
9. **Reviews with real customer photos**, not testimonial text in a box.

### Later

10. Dry fruits and healthy snacking category (your stated roadmap)
11. Gift cards / e-vouchers
12. Referral — give Rs 200, get Rs 200
13. Stockist map, if you go retail

---

## 3. UX decisions that specifically matter in Pakistan

- **No forced account.** Guest checkout only at launch; accounts kill conversion here.
- **Phone number is the identity, not email.** Order lookup by phone plus order number.
- **WhatsApp is the support channel.** Order confirmation should deep-link into a WhatsApp thread, not only send an email.
- **COD is the default**, pre-selected. Bank / JazzCash transfer second, with screenshot upload.
- **Show the delivery fee and daily cutoff before checkout**, on the product page. Surprise delivery cost is the top cart-abandonment cause in Pakistani ecommerce.
- **Design for a mid-range Android on 4G.** Under 2.0s LCP, or the motion work is wasted on people who never see it.
- **Roman-Urdu microcopy, used sparingly** — "aaj hi press hua", "ghar tak" — as warmth, never as translation.
- **Delivery slot selection**, because with a cold chain the arrival time genuinely matters.

---

## 4. Brand-building features competitors can't copy in a weekend

1. **The live batch counter.** The hero shows today's real pressing time, city, and bottles remaining, driven from admin. Scarcity that happens to be true. Nothing else on the site will do as much for the freshness claim.
2. **Batch numbers on every order.** The confirmation reads "Batch 06-09-A, pressed 6:40 AM." Costs nothing, feels like a winery.
3. **Seasonality as a feature.** A visible harvest calendar — kinnow in winter, falsa in summer, mango in season. Turns limited availability from an apology into a reason to buy now.
4. **The unboxing moment.** The ice-box photo is your best asset. Build the gifting scroll sequence around the reveal, and make the handwritten note card a real, purchasable option.
5. **An honesty panel.** Actual sugar content and no-added-sugar claims stated plainly. The category is full of vague health language; specificity is the differentiator.
6. **A named house voice.** Warm, plain, first-person plural, no corporate jargon — written into a tone document so a hired hand can't dilute it.

---

## 5. UI upgrades beyond the original plan

- **A real design system, not just tokens** — spacing scale, type scale, elevation, radii, motion durations and easings, documented on an internal `/style` route so every future page stays consistent.
- **Per-product accent colour** sampled from each photo, applied to that product's page, card and cart line. Variety inside a fixed cream-and-terracotta frame.
- **Grain and paper texture** at low opacity over the cream fields — the cheapest effective way to make a screen feel like the label stock.
- **Editorial asymmetry** in the shop grid instead of uniform cards.
- **Dark mode deferred.** A cream-first brand doesn't need it at launch, and a bad dark mode costs more than none.
- **Empty, loading and error states designed**, not defaults — brand-coloured skeletons, an empty cart with personality.
- **Accessibility treated as a brand value** — visible focus rings, 4.5:1 contrast minimum, full keyboard operation, every animation reduced-motion safe.

---

## 6. Revised phase plan

| Phase | Ships | Purpose |
|---|---|---|
| **0** | Tokens, wordmark SVG, layout shell, Lenis + GSAP foundation, `/style` system page | foundation |
| **1** | Home, Shop, Product, Gifting, Story, FAQ, Contact — full motion system | the showable site |
| **2** | Gifting configurator | the differentiator |
| **3** | DB, cart, checkout (COD + transfer), order emails, WhatsApp handoff, tracking | it sells |
| **4** | Admin — orders, products, batch note, zones, cutoff | you operate it |
| **5** | Subscription, journal, reviews, referral | it retains |
| **6** | SEO, performance, analytics, accessibility audit, launch | it ships |

Phases 0 and 1 are the priority at 7:00 AM.

---

## 7. Open questions

1. Real SKU list — names, sizes, prices, and which photo belongs to each.
2. Delivery: Lahore only at launch, or nationwide for gifting boxes?
3. Subscription in launch scope, or Phase 5 as planned?
4. Bank / JazzCash details to display at checkout.

_Resolved: wordmark — rounded geometric sans (see Decisions locked, section 0)._

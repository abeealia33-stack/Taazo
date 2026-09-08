# taazo. — Full Build Brief

_The complete instruction for the build session. Read `BRAND-AND-UX-PLAN.md` and `ADMIN-PLAN.md` first; this file says how to execute them._

**Mandate: build the entire website to completion in one continuous run.** Storefront, gifting configurator, checkout, order system, admin panel, and launch readiness. Do not stop at a phase boundary to ask permission — the owner has explicitly authorised the full build. Stop only for something genuinely unsafe or genuinely impossible, and if that happens, finish everything else first.

---

## 0. Starting state

Already on disk at `c:/Users/DELL/Desktop/Taazo`:

- Next.js 16 (App Router) + TypeScript + Tailwind v4, scaffolded at repo root, `src/` layout, `@/*` alias
- Installed: `gsap@3.15`, `lenis`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`
- `docs/BRAND-AND-UX-PLAN.md`, `docs/ADMIN-PLAN.md`, this file
- `_incoming-photos/` — check it first for real product photos; `prototype.html.bak` is the retired static prototype, useful only as a copy reference
- Port 3000 is free

Still to install: `prisma`, `@prisma/client`, `next-auth@beta`, `bcryptjs`, `date-fns`, `clsx`, `tailwind-merge`, `sonner`, `lucide-react`, `@vercel/blob` (or local disk adapter in dev).

**Database:** local MongoDB 7.0 running as a Windows service on `127.0.0.1:27017`. Use `mongodb://localhost:27017/taazo`. Read the transaction caveat in section 1 before writing any write path — it changes how stock decrement must be implemented.

---

## 1. Non-negotiable constraints

**Build with zero external accounts.** The owner has not supplied an email API key, blob token, WhatsApp number or bank details. The site must run completely on `npm run dev` with none of them:

- **Database: MongoDB, supplied by the owner.** Local MongoDB 7.0 is installed and running as a Windows service on `127.0.0.1:27017`. Use `DATABASE_URL="mongodb://localhost:27017/taazo"` — note the database name `taazo`, which the owner's bare connection string omitted. Use **Prisma with the `mongodb` provider**, not Mongoose: the schema in `ADMIN-PLAN.md` is already relational in shape, and Prisma keeps it typed end to end.

  **Transaction caveat — read this before writing any write path.** The local server is a **standalone** instance (no `replication` block in `mongod.cfg`). Standalone MongoDB does not support multi-document transactions, and Prisma's `$transaction` and nested writes depend on them. At the start of the run, detect which situation applies:

  1. **If the server is a replica set** (check `db.hello().setName`) — use `prisma.$transaction` normally for stock decrement and order creation, exactly as specified.
  2. **If it is still standalone** — do not attempt transactions; they will fail at runtime. Use this pattern instead, which is safe on a standalone server:
     - **Reserve stock first** with a single atomic conditional update — `updateMany` on the batch-stock document with a filter requiring `bottlesRemaining >= qty` and an `$inc` of `-qty`. A document-level update is atomic on standalone MongoDB, so this alone prevents overselling.
     - **Then create the order.** If order creation fails, compensate by incrementing the reserved stock back.
     - Record a `reservationId` on both sides so a crash between the two steps is recoverable, and add a startup sweep that releases reservations with no matching order older than 15 minutes.

  Isolate all of this behind a small `reserveStock()` / `releaseStock()` module so the transactional path can replace it later with a one-file change. Document clearly in `README.md` how to convert the local server to a single-node replica set to get real transactions, and note that **production should use MongoDB Atlas**, which is a replica set by default and therefore supports transactions with no code change.

  Schema notes for the `mongodb` provider: ids are `String @id @default(auto()) @map("_id") @db.ObjectId`, relation scalars need `@db.ObjectId`, there is no `@@index` shorthand for text search (declare indexes explicitly), and `OrderItem`, `BatchStock` and `PaymentProof` are better modelled as **embedded composite types** inside their parents than as separate collections — use `type` blocks where the child is never queried independently.
- **File uploads:** a `StorageAdapter` interface with a local-disk implementation writing to `public/uploads/` in dev, and a Vercel Blob implementation behind the same interface for production.
- **Email:** a `Mailer` interface. Dev implementation logs the rendered email to the console. Resend implementation behind the same interface, activated by env var.
- **WhatsApp:** click-to-send deep links (`https://wa.me/<number>?text=<encoded>`), no API. Number comes from a `Setting` row with a placeholder default.
- **Payments:** a `PaymentProvider` interface with `CashOnDelivery` and `BankTransfer` implementations. No gateway. Adding Safepay later must be one new file.

Every placeholder value goes in `.env.example` with a comment saying what it is and where to get it. Never commit real secrets.

**Design fidelity is part of the definition of done.** A working-but-ugly site is a failed build. The motion system and visual quality described in the plan are requirements, not garnish.

**Honesty in reporting.** Run `npm run build` and `npm run lint` before reporting. If something fails or is incomplete, say so plainly with the output. Never claim completion for work that is not done.

---

## 2. Brand system

**Colours** (CSS variables + Tailwind theme tokens):

```
terracotta  #C4602F   brand, CTAs, wordmark
deep-olive  #2F3A22   contrast sections
gold        #D9A441   accents, highlights
cream       #F6EFE3   the constant ground
charcoal    #2B2117   text; replaces pure black everywhere
```

Plus a warm neutral ramp derived from cream and charcoal, and per-product accent colours sampled from each photo.

**Wordmark — LOCKED.** The rounded geometric sans from the carrot-juice bottle and peach iced tea. Trace it as an **inline SVG component**, never re-set in a live font, so it is pixel-identical at every size: logo, nav, footer, favicon, page-transition curtain, order emails, admin header. The serif wordmark on the fruit jars is **retired**.

**Typeface:** Poppins or Outfit — pick whichever sits closer to the traced wordmark — via `next/font` self-hosted. No Google Fonts CDN link.

**Texture:** subtle grain overlay at low opacity on cream fields, so the screen reads like label stock. It must not cost measurable performance — a tiling SVG or CSS, not a large PNG.

**Also build `/style`**, an internal page documenting every colour, type step, spacing step, radius, shadow, motion duration and easing, plus every component in every state. This is what keeps the site consistent as it grows.

---

## 3. Photography

Check `_incoming-photos/` first.

**If real photos are there:** optimise them, generate AVIF/WebP via `next/image`, write real alt text, and sample each product's accent colour from its own photo.

**If not:** build designed placeholder blocks — brand-coloured fields with grain, the accent colour, and the product name set in the brand type. Not grey boxes. Lock them to the final aspect ratios (**hero 3:2, product 4:5, gifting 1:1, story 16:9**) so real photos slot in with no layout change. Centralise them in one `<ProductImage>` component so the swap is a single change.

**Label consistency rule:** until the fruit-jar and ice-box labels are reprinted with the correct wordmark, lead with carrot-juice and iced-tea imagery in hero and brand positions. Never show two competing wordmarks side by side.

---

## 4. Products — assumed data, flag everything

The real SKU list is still outstanding. Derive a plausible range from the actual products visible in the photos:

- Fresh-cut fruit jars (dragonfruit / mango / kiwi / watermelon / strawberry mixes)
- Cold-pressed carrot & orange juice, 350ml
- Peach iced tea
- Six-bottle gift box, packed on ice

Put them in a seed file with clearly assumed names, prices in PKR, sizes, ingredients and nutrition. **Collect every assumption into one list at the end of the run** so the owner can correct names and prices in a single pass. Do not scatter assumptions through the report.

---

## 5. Motion system

GSAP 3.15 + Lenis. Twelve authored moments:

1. Entry — cream screen, wordmark draws, juice-coloured wipe reveals hero. Once per session, ~900ms, skippable
2. Hero headline — SplitText line-mask reveal, staggered
3. Hero image — slow parallax drift with subtle scale
4. Section wash — background scrubs cream → deep olive entering gifting
5. Product reveals — staggered rise with per-card accent glow
6. Card hover — lift, 2° tilt toward cursor, accent bleed behind
7. Pinned process — bottle fills via `clip-path` scrubbed by ScrollTrigger
8. Pinned gifting — six bottles reveal one by one on scroll
9. Add to cart — GSAP Flip: bottle flies into the cart icon, which pulses
10. Cart drawer — slides in, Lenis paused beneath, contents stagger
11. Page transitions — cream curtain carrying the wordmark
12. Micro — magnetic buttons, price digit rolls, freshness marquee

**Guardrails, enforced:**

- Every animation collapses to a fade under `prefers-reduced-motion`
- GSAP and Lenis load **below the fold only** — hero renders and is interactive before animation JS arrives
- Lenis **disabled on touch devices**; inertial scroll fights the OS on mobile
- Target **LCP under 2.0s on a mid-range Android on 4G**. If a motion feature threatens that budget, the budget wins
- All ScrollTriggers cleaned up on unmount; no memory leaks across client-side navigation
- Animate `transform` and `opacity` only. No layout-thrashing properties

---

## 6. What to build, in order

### Phase 0 — Foundation
Tokens, traced wordmark SVG, fonts, grain, layout shell, header with cart, footer, Lenis + GSAP providers, `/style` system page, component primitives, SEO defaults, `not-found` and `error` pages.

### Phase 1 — Storefront
- **Home** — hero with live batch line, featured products, gifting teaser, pinned process, story teaser, reviews, WhatsApp CTA
- **Shop** — editorial asymmetric grid, category filter, per-product accents
- **Product** — sticky image column, ingredients, nutrition and honesty panel, delivery fee and cutoff shown here, quantity, add to cart, related products
- **Gifting** — pinned reveal sequence, box tiers, corporate CTA
- **Story** — sourcing narrative, orchards, process, harvest/seasonality calendar
- **FAQ** — freshness, cold chain, delivery areas and timings, what to do if a bottle arrives warm
- **Contact** — WhatsApp-first, form secondary
- Persistent WhatsApp float button

### Phase 2 — Gifting configurator
Build-your-box: size (4 / 6 / 12), flavour picker with live box preview, handwritten note card text, recipient details, delivery date. Priced dynamically, adds to cart as a single configured line item. **This is the differentiator — give it real design effort.**

### Phase 3 — Commerce
Prisma schema per `ADMIN-PLAN.md` §3, migrations, seed. Zustand cart persisted to localStorage. Cart drawer. Guest checkout, no accounts — name, phone, address, area, city, delivery slot. Zone-based delivery fee and minimum. Same-day cutoff logic in Asia/Karachi. COD (pre-selected) and bank transfer with screenshot upload. Coupon support. Stock decrement inside a transaction. Idempotency key on submit. Order confirmation page with order number and batch code. Order emails via the Mailer interface. WhatsApp deep-link handoff. **Order tracking** by order number + phone.

### Phase 4 — Admin
Everything in `ADMIN-PLAN.md`, in its build order 4.1 → 4.9: auth and audit log, orders, batches with the live counter, products with photo upload, payment-proof queue and cash reconciliation, delivery zones and riders and pack lists, gifting and corporate leads, reports with CSV export, content and settings. Mobile-first, zero animation, fast.

### Phase 5 — Retention
Subscription ("the weekly batch"), journal, reviews with photo upload and admin approval, referral codes.

### Phase 6 — Launch readiness
Metadata and Open Graph per route, JSON-LD (Organization, Product, FAQ), sitemap and robots, favicon and app icons from the wordmark, analytics hook, **accessibility audit** (visible focus rings, 4.5:1 contrast, full keyboard operation, correct heading order, labelled forms, live-region announcements), **performance pass** (bundle analysis, image sizing, font display, code splitting), and a `README.md` covering local setup, the Postgres switch, env vars, deployment, and how to run the admin.

---

## 7. Definition of done

- [ ] `npm run build` passes clean
- [ ] `npm run lint` passes clean
- [ ] `npx tsc --noEmit` passes clean
- [ ] Every route renders without console errors
- [ ] Full purchase path works end to end on the dev database: browse → configure gift box → cart → checkout → order created → confirmation → visible in admin → status advanced → tracking page reflects it
- [ ] Admin login works; seeded admin credentials documented in `README.md`
- [ ] `prefers-reduced-motion` verified — no motion sickness, nothing breaks
- [ ] Keyboard-only navigation works across the storefront and admin
- [ ] Mobile viewport (390px) verified on every page; no horizontal scroll anywhere
- [ ] `.env.example` complete and commented
- [ ] Seed script produces realistic sample products, batches and orders
- [ ] One consolidated list of every assumed product name and price, for the owner to correct

---

## 8. Reporting at the end

Give the owner, in this order:

1. **What was built** — brief, by phase
2. **How to run it** — the exact commands, and the admin login
3. **Assumptions to correct** — the single consolidated product name/price list
4. **What needs their input to go live** — real photos, real SKUs and prices, bank/JazzCash details, WhatsApp number, delivery zones and fees, cutoff time, and the Postgres URL for production
5. **Anything incomplete or failing** — honestly, with output

Do not overstate. If a phase is partial, say which parts and why.

# taazo.

Cold-pressed juice, fresh fruit jars and iced tea — storefront, checkout and admin panel.

Next.js 16 · TypeScript · Tailwind v4 · MongoDB (Prisma) · GSAP + Lenis

---

## Running it

```bash
npm install
npm run db:push     # create the collections and indexes
npm run db:seed     # products, delivery zones, today's batch, admin user, sample orders
npm run dev         # http://localhost:3000
```

**Admin panel:** <http://localhost:3000/admin>
Email `abeealia33@gmail.com`, password `taazo-admin` — **change this before launch** (see below).

### Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync the Prisma schema to MongoDB |
| `npm run db:seed` | Seed catalogue, zones, batch, admin, sample orders (safe to re-run) |
| `npm run db:studio` | Prisma Studio — browse the database |

---

## Database

Local MongoDB on `127.0.0.1:27017`, database `taazo`, running as a **single-node replica set** (`rs0`).

The replica set matters: Prisma's MongoDB connector implements `upsert` and nested writes with transactions, which a standalone server rejects. It was configured by adding to `mongod.cfg`:

```yaml
replication:
  replSetName: rs0
```

then restarting the MongoDB service and running `rs.initiate()`. The original config is backed up alongside it as `mongod.cfg.bak-taazo`.

**Production:** use MongoDB Atlas. It is a replica set by default, so only `DATABASE_URL` changes — no code changes.

### Stock is moved atomically, without transactions

A batch and all of its per-product stock live in one document, and MongoDB guarantees single-document updates are atomic. `src/lib/stock.ts` reserves an entire basket in one `findAndModify`: the filter asserts every line has enough stock, the update decrements them all together. If any line is short, nothing moves. Two customers racing for the last bottle cannot both win.

Verified: all-or-nothing reservation, oversell rejection, release-on-failure, and failed deliveries returning bottles as *unsold* rather than losing the wastage data.

---

## Environment

Copy `.env.example` to `.env`. Everything works locally with no external accounts:

| Variable | Needed for | Without it |
|---|---|---|
| `DATABASE_URL` | everything | — (required) |
| `AUTH_SECRET` | admin sessions | — (required) |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, OG tags | falls back to `https://taazo.pk` |
| `RESEND_API_KEY` | sending order emails | emails print to the server console |
| `ORDER_NOTIFY_EMAIL` | where order notifications go | `orders@taazo.pk` |
| `BLOB_READ_WRITE_TOKEN` | production file uploads | files write to `public/uploads/` |

Email, storage and payments each sit behind an interface (`src/lib/mailer.ts`, `src/lib/storage.ts`, and the `cod` / `transfer` methods in checkout). Adding Resend, Vercel Blob or a payment gateway later is one new implementation, not a rewrite.

---

## Media uploads

| What | Where it uploads | Limit | Why |
|---|---|---|---|
| Product photos | Server Action | 8MB | `serverActions.bodySizeLimit` is 12MB in `next.config.ts` |
| Payment proofs | Server Action | 8MB | same |
| Reels (video) | `POST /api/admin/upload` | 64MB | Server Actions cap request bodies; route handlers do not |
| Hero image/video | `POST /api/admin/upload` | 8MB / 64MB | same |

**The 1MB trap:** Next.js caps Server Action request bodies at 1MB by default, so any photo over that was silently rejected regardless of the storage layer's own limit. `next.config.ts` raises it to 12MB. Video never goes through that path at all — the forms on `/admin/reels` and the hero control on `/admin/settings` POST directly to the route handler, which streams the body with no cap and works with JavaScript disabled.

Files land in `public/uploads/` locally and Vercel Blob in production, behind the same `StorageAdapter` interface.

## Reels

`/admin/reels` uploads short vertical videos with an optional cover image, caption and Instagram link, reorders them, hides them, or deletes them (which removes the files too — unlike products, a reel has no downstream references).

They appear on the homepage as a scroll-snapping rail. Each plays muted when it scrolls into view and pauses when it leaves, so a dozen videos never decode at once, with a control to turn sound on. Under `prefers-reduced-motion` nothing autoplays. If no reels are uploaded, the section renders nothing rather than an empty carousel.

## Structure

```
src/
  app/
    (site)/          storefront — home, shop, gifting, story, faq, contact,
                     corporate, track, checkout
    admin/           admin panel — its own layout, no cart, no animation
    layout.tsx       html + fonts only
  components/
    brand/           the wordmark, drawn as SVG
    layout/          header, footer, WhatsApp float, page header
    motion/          Lenis smooth scroll, scroll reveals
    product/         product card, photo slots
    cart/            drawer, button, add-to-cart
    gifting/         the build-your-box configurator
    home/            homepage sections
    admin/           admin nav and UI primitives
  lib/               db, auth, stock, orders, batch, mailer, storage, site config
  data/products.ts   ⚠ assumed catalogue — the file to correct
  store/cart.ts      Zustand cart, persisted to localStorage
prisma/
  schema.prisma      MongoDB models
  seed.ts            seed script
docs/                brand plan, admin plan, build brief
```

---

## Design system

`/style` documents every colour, type step, spacing, radius, shadow and motion duration, plus every component state. It is `noindex` and not linked from the site. **Add tokens there first**, then use them — that is what keeps new pages consistent.

The wordmark is drawn as SVG paths in `src/components/brand/Wordmark.tsx`, never set in a live font, so it renders identically everywhere. If you get the original vector from a designer, replace the paths in that one file.

### Motion

GSAP and Lenis are **never** in the initial bundle — they load on demand, below the fold. The hero renders and is interactive before any animation JS arrives. Lenis is disabled on touch devices, where inertial scrolling fights the OS. Every animation collapses to a fade under `prefers-reduced-motion`.

Most scroll reveals use IntersectionObserver and CSS, not GSAP. GSAP is loaded only by the pinned process section.

---

## Before launch

1. **Correct `src/data/products.ts`** — every name, price, size and description in it is assumed, not yours.
2. **Change the admin password** and the `ADMIN_EMAIL` in `prisma/seed.ts`.
3. **Generate a real `AUTH_SECRET`** — `openssl rand -base64 32`.
4. **Delete the sample orders** — the three `TZ-SAMPLE-*` orders created by the seed.
5. **Fill in `src/lib/site.ts`** — WhatsApp number, phone, email, social links.
6. **Set the bank details** in admin → Settings, so bank transfer at checkout shows real information.
7. **Check the delivery zones** in `prisma/seed.ts` — areas, fees and minimums are guesses.
8. **Add real photos** to `public/photos/` and set the `photo` path on each product. Aspect ratios are locked (hero 3:2, product 4:5, gifting 1:1, story 16:9) so nothing shifts.
9. **Reprint the fruit-jar and ice-box labels** with the rounded-sans wordmark — they currently carry the retired serif.
10. **Replace the placeholder reviews** in `src/components/home/Reviews.tsx` with real customer words.

---

## Daily operation

1. **Open the batch** (admin → Batches): pressing time, bottles made per product. This puts stock on the site and starts the live counter in the hero.
2. **Orders arrive** — confirm each from admin → Today.
3. **After the cutoff** (1pm by default, configurable) same-day ordering closes automatically and later orders roll to tomorrow.
4. **Pack and dispatch** — advance each order's status.
5. **Close the batch** at end of day, recording how many bottles were wasted.

Step 5 is the one people skip and shouldn't. Made-versus-sold per product per day is the number that tells you how much to press tomorrow, and it is where fresh-juice margin is won or lost. Admin → Reports turns it into a sold-through rate.

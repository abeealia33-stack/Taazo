# taazo. — Admin Panel Plan

_Written 2026-09-06. Companion to `BRAND-AND-UX-PLAN.md`. Build phase 4, after storefront and checkout._

---

## 1. The governing idea

This is not a CMS. It is a **daily operations tool**, used on a phone, one-handed, at 6:40 in the morning, in a kitchen, possibly with wet hands, on patchy mobile data.

Every design decision follows from that:

- **Mobile-first, genuinely** — not "responsive desktop." The primary device is a phone. Desktop is the secondary layout.
- **Optimised for the daily loop**, not for feature completeness. The screens you touch fifty times a week get one tap; the screens you touch monthly can take five.
- **Large touch targets, high contrast, no hover-dependent controls.** Nothing critical hidden behind a hover state or a long-press.
- **Optimistic UI with offline tolerance.** Status changes apply instantly and sync in the background, because the cold room has bad signal.
- **Destructive actions always confirm**, and nothing is ever hard-deleted — everything is archived, because a mis-tap at 6 AM should never lose an order.

### The daily rhythm the panel is built around

```
06:00  Open batch      set today's pressing time, batch code, bottle counts per SKU
06:00  → live          hero counter goes live on the site, products come in stock
06:00  orders arrive   push notification per order, one-tap confirm
13:00  cutoff          same-day ordering closes automatically; later orders roll to tomorrow
13:15  pick & pack     printable/mobile pack list, grouped by delivery zone
14:00  dispatch        assign to rider, bulk-mark out for delivery, customers notified
19:00  close day       mark delivered, record unsold bottles, reconcile COD cash
```

Everything in the panel serves one of those seven moments.

---

## 2. Access and security

**Single owner account at launch**, with the structure in place for staff later.

| Role | Can do |
|---|---|
| **Owner** | everything, including prices, settings, and financial reports |
| **Staff** | orders, batches, pack lists, delivery status. Cannot see revenue reports, cannot change prices, cannot alter settings |
| **Rider** _(later)_ | a stripped mobile view: today's assigned deliveries only, mark delivered, record cash collected |

**Implementation**

- Auth.js with credentials, bcrypt-hashed passwords, sessions in the database
- All `/admin/*` routes protected in middleware — no client-side-only guards
- Every mutation re-checks the role server-side; the UI hiding a button is never the security boundary
- Rate-limited login, generic failure messages, lockout after repeated failures
- **Audit log** on every state change: who, what, before, after, when. In a cash business with staff, this matters more than it sounds
- Sessions expire in 30 days on a trusted device, and there is a visible "sign out everywhere"
- Payment-proof uploads served through signed, expiring URLs — never public bucket links

---

## 3. Data model

> **Database: MongoDB** (local 7.0 at `mongodb://localhost:27017/taazo`, Atlas in production), via Prisma's `mongodb` provider. The sketch below is written relationally for readability. When implementing: ids become `String @id @default(auto()) @map("_id") @db.ObjectId`, every relation scalar gets `@db.ObjectId`, and `OrderItem`, `BatchStock` and `PaymentProof` become **embedded composite types** inside `Order` and `Batch` rather than separate collections, since they are never queried independently. `OrderEvent` and `AuditLog` stay separate collections — they are queried and paginated on their own. See `BUILD-BRIEF.md` §1 for the standalone-server transaction caveat that governs stock writes.

```prisma
AdminUser      id, name, phone, email, passwordHash, role, active, lastLoginAt
AuditLog       id, actorId, entity, entityId, action, before(json), after(json), createdAt

Product        id, slug, name, tagline, description, category, sizeMl,
               price, compareAtPrice?, accentColor, ingredients[], nutrition(json),
               sortOrder, active, archivedAt
ProductPhoto   id, productId, url, alt, role(hero|grid|detail), sortOrder

Batch          id, code, pressedAt, city, note, status(draft|live|closed), createdAt
BatchStock     id, batchId, productId, bottlesMade, bottlesSold, bottlesUnsold, bottlesWasted

Order          id, orderNumber, status, customerName, phone, altPhone?,
               addressLine, area, city, zoneId, deliverySlot, deliveryDate,
               paymentMethod(cod|transfer), paymentStatus(pending|verified|failed),
               subtotal, deliveryFee, discount, total, amountCollected?,
               batchId?, riderId?, notes, source(web|whatsapp|phone), createdAt
OrderItem      id, orderId, productId, nameSnapshot, priceSnapshot, qty
PaymentProof   id, orderId, url, uploadedAt, verifiedAt?, verifiedBy?, rejectedReason?
OrderEvent     id, orderId, fromStatus, toStatus, actorId, note, createdAt

GiftBox        id, orderId, boxSize, items(json), noteCardText, recipientName,
               recipientPhone, deliverAt, isGift
CorporateLead  id, company, contactName, phone, email, headcount, budget,
               occasion, eventDate, message, status(new|contacted|quoted|won|lost)

DeliveryZone   id, name, areas[], fee, minOrder, sameDayCutoff, active
Rider          id, name, phone, active

Coupon         id, code, type(percent|fixed|freeDelivery), value, minOrder,
               usageLimit, usedCount, startsAt, endsAt, active
Subscription   id, customerPhone, planId, items(json), frequency, nextDeliveryAt,
               status(active|paused|cancelled), pausedUntil?
Setting        key, value(json)   // cutoff time, WhatsApp number, bank details, toggles
```

**Two deliberate choices worth calling out.** Order items store a `nameSnapshot` and `priceSnapshot` — an order must show what the customer actually paid, even after you change the price next week. And nothing is hard-deleted; products carry `archivedAt` so old orders never break.

---

## 4. Screens

### 4.1 Today — the home screen

The screen that opens by default and answers "what do I need to do right now."

- **Batch strip at the top** — today's batch code, pressing time, bottles remaining per SKU, and a big **Open / Close batch** button
- **Live counters** — new orders, awaiting confirmation, packed, out for delivery, delivered, cash to collect today
- **Action queue** — orders needing something from you: unverified payment proofs, orders older than 30 minutes still unconfirmed, out-of-stock items on pending orders
- **Countdown to cutoff**, prominent
- One tap from every row into the order

### 4.2 Orders

**List:** newest first, filterable by status, date, zone, payment method, and search by phone or order number. Each row shows order number, customer, area, total, payment method, status, and time since placed — colour-coded by urgency.

**Bulk actions** with checkboxes: confirm, mark packed, assign rider, mark out for delivery, print pack slips. Bulk is essential; nobody taps through forty orders individually.

**Detail view:** items with photos, customer and address with a tap-to-call and tap-to-WhatsApp, payment method and proof image, the delivery zone and fee, an internal notes field, the full event timeline, and the status control.

**Status flow** — forward is one tap, backward requires a reason:

```
pending → confirmed → packed → out for delivery → delivered
                ↓            ↓          ↓
            cancelled    cancelled   failed → rescheduled
```

`failed` matters. COD deliveries fail — nobody home, phone off, refused. A failed delivery records a reason, keeps the bottles in the system, and offers reschedule or cancel.

**Manual order entry**, because a real share of your orders will arrive by WhatsApp or phone and must live in the same system as web orders. `source` records where each came from.

### 4.3 Batches — the operational heart

This is the screen that makes the freshness claim true and keeps you from overselling.

- **Open today's batch:** set pressing time, auto-generated batch code (`06-09-A`), city, an optional public note that appears on the site, and bottles made per SKU
- Opening a batch sets those SKUs in stock and starts the **live hero counter**; the counter decrements with each order
- **Close the batch** at end of day: record bottles unsold and bottles wasted per SKU
- **Batch history** with sold-through rate per SKU

**Why this earns its complexity:** wastage is where fresh-juice margin dies. Tracking made-versus-sold per SKU per day tells you within two weeks exactly how much of each product to press — the single most valuable number in the business. It also drives the site's honest scarcity, and puts a real batch code on every order confirmation.

### 4.4 Products

Card grid with drag-to-reorder — order here is the order on the site. Per product: name, tagline, description, category, size, price, ingredients, nutrition, accent colour (with a picker seeded from the photo), and photo upload with drag-and-drop reordering and alt text. An **active toggle** takes a product off the site instantly without deleting it, and archive keeps history intact. A live preview of the product card as it will appear on the storefront.

### 4.5 Gifting and corporate

Gift orders need their own view because they behave differently: a recipient distinct from the buyer, a note card to write out and include, a scheduled delivery date that is usually not today, and packaging that differs.

- **Gift order view** — box contents, the note card text rendered ready to copy or print, recipient details, scheduled date
- **Upcoming gift calendar**, so a wedding order three weeks out doesn't ambush you
- **Corporate leads pipeline** — new → contacted → quoted → won → lost, with notes and follow-up dates

### 4.6 Delivery

Zone management: area names, fee, minimum order, same-day cutoff, active toggle. A rider list, and today's deliveries grouped by zone with each rider's assignments. Later, a rider-facing mobile view with a mark-delivered button and cash collected.

### 4.7 Payments and cash reconciliation

- **Proof verification queue** — the uploaded screenshot beside the order total, with verify or reject-with-reason. Verifying moves payment status and notifies the customer
- **Daily cash reconciliation** — expected COD versus collected, per rider, with variances flagged. In a cash business this is non-negotiable

### 4.8 Reports

Deliberately few, and each tied to a decision:

| Report | The decision it drives |
|---|---|
| Revenue by day / week / month | how the business is trending |
| Sold-through vs wasted per SKU | how much to press tomorrow |
| Top products | what to promote, what to cut |
| Orders by zone | where to expand delivery, where to stop |
| New vs repeat customers | whether the brand is actually working |
| Average order value | whether gifting and bundles are lifting the basket |
| Failed-delivery rate by area | which areas cost you money |

Everything exports to CSV. No dashboard vanity metrics.

### 4.9 Content and settings

Homepage hero copy, story page content, FAQ entries, journal posts, testimonials and review approval. Settings hold the WhatsApp number, bank and JazzCash details shown at checkout, the daily cutoff time, delivery-fee defaults, an order-notification toggle, and a **maintenance / "sold out for today" mode** that puts an honest message on the site instead of a broken checkout.

---

## 5. Notifications

**To you, on every new order:** a browser push notification, and a WhatsApp deep link. Configurable quiet hours, so a 2 AM order doesn't wake you.

**To the customer, automatically:**

| Trigger | Channel | Content |
|---|---|---|
| Order placed | email + WhatsApp link | order number, items, total, batch code |
| Confirmed | WhatsApp | expected delivery slot |
| Out for delivery | WhatsApp | rider name and phone |
| Delivered | WhatsApp | thank-you, review request |
| Payment verified | WhatsApp | confirmation |
| Payment rejected | WhatsApp | reason, what to do next |

WhatsApp sends are click-to-send deep links at launch — pre-composed messages you tap to send — rather than the Business API, which needs approval and template review. The interface is built so the Business API drops in later without touching the call sites.

---

## 6. Edge cases the panel must handle

These are where a naive admin panel breaks in month two:

1. **Overselling.** Stock decrements at order placement, not at confirmation, inside a transaction. Two people ordering the last bottle simultaneously — one gets it, one gets a clear message.
2. **Cutoff crossing.** An order placed at 12:59 that submits at 13:01 gets the terms it was shown, not new ones.
3. **Failed COD delivery.** Bottles return to stock as unsold; the order is marked failed with a reason, not silently cancelled.
4. **Partial delivery.** Some items unavailable — the order can be partially fulfilled with the total recalculated and the difference recorded.
5. **Price changed after order.** Snapshots mean the order always shows what was actually charged.
6. **Product archived with live orders.** Archive, never delete; historical orders keep rendering.
7. **Duplicate order from a double tap.** Idempotency key on submission.
8. **Customer edits address after ordering.** Editable while status is pending or confirmed, locked after packed, with the change written to the event log.
9. **Rejected payment proof.** Order stays open, customer is told why, with a re-upload link.
10. **Timezone.** Everything stored UTC, displayed Asia/Karachi. Cutoffs and batch codes computed in local time — a batch code must never roll over at the wrong midnight.

---

## 7. Technical approach

Same Next.js app, routes under `/admin`, so there is one deploy and one auth system.

- **Server Components** for lists and detail views; **Server Actions** for mutations, with Zod validation on every input
- **Optimistic updates** via `useOptimistic` for status changes, since those happen constantly on bad connections
- **Atomic stock movement** — a transaction if the MongoDB server is a replica set, otherwise the atomic conditional-update reserve/release pattern in `BUILD-BRIEF.md` §1. Never a read-then-write
- **Vercel Blob** for product photos and payment proofs; product images run through `next/image`, proofs behind signed URLs
- **Zero animation.** The storefront gets GSAP; the admin gets speed. Instant, plain, functional — the two are deliberately different products
- Its own minimal component set: table, filter bar, status pill, stat card, sheet, confirm dialog. No admin template library
- **Seed script** with realistic sample orders so the panel can be built and tested before real traffic

---

## 8. Build order

| Step | Ships | Why this order |
|---|---|---|
| **4.1** | Auth, admin shell, nav, audit log | nothing else is safe without it |
| **4.2** | Orders list + detail + status flow | the panel is useless without this |
| **4.3** | Batches — open, close, stock, live counter | unblocks the site's freshness feature |
| **4.4** | Products CRUD + photo upload | you stop needing a developer |
| **4.5** | Payment proof queue + cash reconciliation | money stops leaking |
| **4.6** | Delivery zones, riders, pack lists | packing gets fast |
| **4.7** | Gifting, corporate leads | serves the differentiator |
| **4.8** | Reports + CSV export | you start deciding on data |
| **4.9** | Content, settings, notifications | polish |

**4.1 through 4.3 is a genuinely usable panel.** Everything after that is leverage.

---

## 9. Open questions

1. Will anyone besides you use this at launch — staff, or a rider?
2. Do you deliver yourself, or through a courier? If courier, which one, and does it have an API worth integrating?
3. Do you want printed pack slips and labels, or is a phone screen enough?
4. Are you tracking ingredient cost per bottle? If so, the panel can report true margin, not just revenue.
5. What is the daily same-day cutoff time?

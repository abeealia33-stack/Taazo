# Taazo: dry fruits and apricot oil transition plan

Prepared 13 October 2026. This is a proposed direction, not an implemented redesign.

Update 14 October 2026: the current public-site direction is now Chulimaar's single-product culinary oil pre-launch. See [CHULIMAAR-PRELAUNCH-BLUEPRINT.md](./CHULIMAAR-PRELAUNCH-BLUEPRINT.md). The broader dry-fruits/commerce recommendations below are retained as earlier planning, not the current pre-launch scope.

## Recommendation

Keep the Taazo name, wordmark, cream background, terracotta, olive and warm typography. Reposition the storefront around dry fruits, apricot oil and thoughtful gifts. Reuse the catalogue, cart, guest checkout, admin and order tracking after adapting their product and fulfilment rules.

Suggested positioning: **Carefully sourced dry fruits and apricot oil, packed with care.** This is draft copy. Make more specific origin or processing claims only when supported by the actual products and suppliers.

If fresh juice remains an active business, put it in a clearly labelled Fresh Drinks section with its own local-delivery rules. If it is being discontinued, archive its products and revise or retire its content. Preserve historical orders and redirect useful old URLs where there is a relevant replacement. Avoid a homepage giving equal weight to two very different shopping journeys.

Working assumption: Pakistan is the initial market because the current site uses PKR, Pakistani phone validation and Lahore delivery. Nationwide availability remains conditional on confirmed courier coverage, costs and packaging. Apricot oil's intended use is unresolved; food and personal-care versions require distinct descriptions, labels and evidence.

## Evaluation of the existing site

This review inspected source files and the existing project documents. No browser was available for visual inspection. It does not establish current production content, database inventory, mobile appearance, speed, accessibility or a successful purchase. The local development server could start, but no purchase or database change was attempted.

| Area | Finding | Decision |
|---|---|---|
| Brand | Existing CSS defines a coherent cream, terracotta, olive and gold system with Outfit typography. | Keep the system; adapt photography and product accents. |
| Homepage | Hero says “Pressed this morning. Bottled by noon.” Featured products and process copy reinforce daily juice production. | Rewrite around the new range and actual quality evidence. |
| Navigation | Main links are Shop, Gifting, Story and FAQ; footer categories are juice, jars and tea. | Expose Dry Fruits and Apricot Oil directly. |
| Catalogue/admin | Categories are database driven and product names, photos, ingredients and prices are editable. | Reuse these capabilities; update database content, not just seed files. |
| Product model | Each product has one size and price; there is no dedicated variant/SKU model. | Add pack-size variants with separate stock and prices. |
| Product pages | Ingredient panel, photo gallery, pricing, delivery summary and sticky buy control are already present. They also show juice pressing and batch claims. | Keep the buying structure; use category-specific information. |
| Stock | Ordinary purchases reserve stock from the latest live juice batch; fields count bottles. | Introduce persistent stock by SKU and lot with expiry dates. |
| Checkout | Order city is hardcoded to Lahore; delivery uses local zones, time slots and a same-day cutoff. | Add city/address validation, shipping coverage and dispatch estimates. |
| Gifting | Builder counts bottles; checkout excludes gift boxes from stock reservation and falls back to client-provided prices when no product matches. | Start with fixed boxes; validate every component and price on the server. |
| Trust | README flags assumed seed products, reviews and delivery data. Their current database state was not verified. | Confirm real catalogue, testimonials and policies before launch. |
| SEO | Default titles, descriptions and keywords advertise juice and Lahore same-day delivery. | Update metadata and sharing images alongside visible content. |

The site is a useful foundation, but adding new categories alone would leave misleading copy and incompatible checkout behaviour.

## Launch range and pricing

Start with a small range that can be sourced consistently. These are proposed products and sizes, not confirmed SKUs:

| Range | Proposed starting offer | Purpose |
|---|---|---|
| Dry fruits | Dried apricots, almonds, walnuts and raisins; add cashews or pistachios if supply and margins work. | A manageable everyday range. |
| Pack sizes | Start with 250g and 500g; add 1kg after demand is established. | Entry purchase and family basket. |
| Apricot oil | One verified formulation and intended use; consider 50ml and 100ml for personal care, with food sizes decided separately. | One clear product customers can understand. |
| Gift boxes | Two fixed assortments with named contents, exact weights and a note-card option. | Higher basket value without a complex configurator. |

Do not buy every proposed variant at launch if it fragments stock. Finalise supplier cost, saleable pack yield, packaging, payment/COD charges, shipping subsidy, likely returns and wastage before setting retail prices.

Track contribution per delivered order: revenue after discounts minus product cost, packing, shipping, payment/COD fees, attributable returns and customer acquisition. Gross margin alone does not show whether a delivered order is profitable. Set free-shipping thresholds from these economics rather than inheriting the existing Rs 3,000 default.

## Proposed storefront

Navigation: **Dry Fruits | Apricot Oil | Gift Boxes | Our Story**, with FAQ, tracking and contact readily accessible and cart always visible. All Products can remain available through Shop.

Suggested homepage order:

1. A real photograph of the new packaging and products. Draft headline: “Dry fruits and apricot oil, packed with care.” Primary button: Shop Dry Fruits. Secondary: Explore Apricot Oil.
2. Two clear category tiles so shoppers can choose their journey immediately.
3. Four featured products with visible pack size, price and availability.
4. Specific quality evidence: actual source, how products are selected, packing process and traceable lot details. Avoid generic badges without support.
5. An apricot oil section that explains exactly what the product is and its intended use.
6. Two gift boxes showing the full contents and weights.
7. Genuine reviews, useful FAQs and WhatsApp support.

Keep motion restrained. Reduce the height of the mobile hero so products are easy to reach. Use consistent card proportions in the shopping grid for comparison; reserve the existing asymmetric editorial treatment for story or gifting sections.

Use real photographs of the pack front, product close-up, net quantity, back label and gift-box contents. Show packaging customers will actually receive. Do not substitute decorative imagery for product evidence.

## Product information customers need

Dry-fruit pages should show name, type/grade where applicable, size selection, price, ingredients, origin when verified, raw/roasted/salted status, allergen information, packing and best-before information, storage guidance, delivery cost/estimate and the relevant return policy. A buyer should understand both the food and the sealed pack before ordering.

The apricot oil page needs a clear intended-use label next to the product name, followed by verified ingredients, processing method, size, origin, lot and shelf-life information, storage, and instructions appropriate to that specific product.

If it is personal care, present it in a separate use context from food, with supplier-supported cosmetic instructions and relevant cautions. If it is edible, build a food-specific page using verified food-use documentation and label information. If both ranges are offered, treat them as separate SKUs and pages. Do not infer edibility from the name “apricot oil,” and do not copy another seller's health claims or usage instructions.

## Commerce and admin changes

Proposed data structure: Product -> Variant/SKU -> Stock lots. Each variant holds net quantity, price, packaging/shipping weight and availability. Each lot holds quantity, supplier/receipt reference, packed date, expiry and stock movements. Orders snapshot the purchased variant and quantity. Shelf-stable stock persists until sold or otherwise adjusted; it must not depend on a fresh juice batch being open.

Use stock lots with the earliest valid expiry first. Preserve reservation, cancellation and return records so stock can be reconciled. Prevent expired/quarantined stock from being sold. If juice continues, retain its daily-batch workflow as a separate stock policy.

For courier orders, collect city, complete address and coverage information; show the shipping quote and dispatch/delivery estimate before payment. Add courier, tracking number, dispatched date and delivery/return status in admin. Do not promise local morning/afternoon delivery slots for courier shipments. Initially require separate orders for local fresh drinks and courier goods if both remain available.

Reuse guest checkout, COD and transfer where supported. Add new payment methods only after the business has working accounts and settlement procedures. Preserve existing orders during migration and reconcile stock and totals before enabling sales.

### Existing checkout issues to address before launch

These findings are from source inspection, not an exploit or end-to-end test:

- Gift boxes currently skip stock reservation. Reserve their component SKUs, multiplied by the number of boxes ordered.
- A missing product falls back to the client's price/name, and the comment promising gift-tier validation is not followed by that validation. Reject unknown products and recompute gift configuration prices and contents from server records.
- The stock module returns a reservation ID, but checkout does not persist it with the order. Implement explicit reservation records/lifecycle before extending the inventory system.
- Post-order side effects share a catch block with stock release. A later failure can release stock even after an order has been created or stock committed. Separate order persistence, stock commitment and retryable notifications/proof handling.
- Order numbers use a count-plus-one sequence. Use a collision-safe counter or unique generation strategy for concurrent orders.

These are launch priorities because they affect orders, pricing and inventory directly.

## Delivery plan: sequenced work

| Stage | Work | Completion condition |
|---|---|---|
| 1. Product decisions | Confirm oil use, suppliers, quality evidence, range, sizes, prices, packaging and initial delivery coverage. | Approved SKU sheet, verified product information and delivery costs. |
| 2. Storefront direction | Revise hero, navigation, cards, product templates, story, FAQs, gifting, footer and metadata. | Desktop and mobile content matches the actual range; no inappropriate juice claims remain. |
| 3. Commerce adaptation | Add variants, stock lots, courier checkout and tracking; correct server pricing, gift stock and reservation lifecycle. | The new products can be bought without a live juice batch, with correct price and stock. |
| 4. Launch verification | Populate real products/photos, confirm policy/payment settings and verify buying/admin flows. | Representative purchases, cancellation, failed payment/notification and courier outcomes reconcile correctly. |
| 5. Controlled launch | Start in confirmed coverage areas and collect real delivery/customer feedback. | Operations work reliably and delivered-order contribution is understood before wider advertising. |

Do not commit a launch date until sourcing, packaging and fulfilment are ready. A small reliable range can launch sooner than a broad catalogue with missing information.

Required implementation checks: build, lint and types; mobile browse-to-order; every size's server price; last-unit concurrent purchases; invalid gift configurations; no live juice batch; unsupported city; shipping quotes; payment proof; duplicate submission; notification failure; cancellation/stock release; tracking and admin reconciliation. Visually inspect mobile layouts, keyboard operation and reduced motion, and measure performance when a browser is available.

## First 30 days after launch

Collect product-level evidence before scaling advertising: product views, selected variants, add-to-cart, checkout start and completed orders. Reconcile website orders against confirmed, dispatched, delivered and returned orders in admin.

Review delivered conversion, average basket value, contribution per delivered order, return-to-origin rate, support reasons and repeat purchases weekly. Choose performance targets after observing the initial baseline. Gift-box content, packing videos, supplier/process evidence and product demonstrations can support marketing when truthful and relevant to the intended use.

Defer subscriptions, loyalty systems, extensive journals, advanced box building and extra animation until the basic range sells and fulfils reliably.

## Inputs to settle

1. Is apricot oil intended for food, skin/hair care, or two separate ranges?
2. Will fresh juices continue, or is this a full product pivot?
3. Which products are available now, with which supplier, sizes and costs?
4. Which origin, processing and quality claims can be substantiated?
5. What packaging, labels and real photos are ready?
6. Which cities, courier, shipping fees, COD terms and dispatch times are confirmed?

## Implementation map

| Change | Main existing locations |
|---|---|
| Positioning and homepage | `src/lib/site.ts`, `src/components/home/`, `src/app/(site)/page.tsx` |
| Navigation/footer | `src/components/layout/SiteHeader.tsx`, `src/components/layout/SiteFooter.tsx` |
| Catalogue and variants | `prisma/schema.prisma`, `src/lib/catalog.ts`, admin product/category screens |
| Product/shop UI | `src/app/(site)/shop/`, `src/components/product/`, `src/components/cart/` |
| Inventory | `src/lib/stock.ts`, `src/lib/liveBatch.ts`, admin batches/products |
| Checkout/shipping | `src/app/(site)/checkout/`, `src/lib/orders.ts`, admin delivery/orders/tracking |
| Gifting | `src/components/gifting/GiftBoxBuilder.tsx`, gift-tier model, checkout validation |
| Content/SEO | `src/lib/content.ts`, admin content/settings, `src/app/layout.tsx`, route metadata, sitemap and sharing images |

Read the relevant installed Next.js guides in `node_modules/next/dist/docs/` before implementation. Existing build/brand documents describe the previous juice direction and should be revised when the new scope is agreed.

## Product-page references

[Al-Fatah's nuts and dry-fruits collection](https://alfatah.pk/collections/nuts-dry-fruits) illustrates explicit pack quantities and a broad assortment. Taazo's proposed smaller launch range is a planning choice, not evidence of demand.

[Conscious Skincare's apricot kernel oil page](https://conscious-skincare.com/products/apricot-kernal-oil) illustrates a clearly named cosmetic product with size choices, ingredient information and usage content. It is a merchandising reference; its claims, certifications and instructions do not establish properties of Taazo's oil.

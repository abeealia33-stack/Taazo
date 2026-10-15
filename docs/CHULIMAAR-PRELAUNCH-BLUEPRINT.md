# Chulimaar pre-launch blueprint against the current Taazo website

Prepared 14 October 2026. Planning document only; no application changes have been made.

## Direction and scope

Convert the current public storefront into one polished Chulimaar introduction page with a launch-interest form and a separate privacy page. Chulimaar starts with apricot kernel oil for cooking, with the founder preparing to press it personally in Skardu.

This replaces the earlier dry-fruits, oil and gifting launch direction for this stage. Bottle sizes, prices, stock, extraction details, launch date and delivery coverage remain unpublished until confirmed. Commerce development is a later milestone.

The pre-launch site's main job is to help a visitor understand the product, its founder and place of production, then register for launch updates. Measure successfully stored signups, not orders.

Review basis: current source files, repository assets and the supplied blueprint. Rendered appearance, live database content and production deployment have not been verified.

## Current website versus proposed website

| Area | Current implementation | Chulimaar pre-launch change |
|---|---|---|
| Brand identity | Taazo SVG wordmark, juice language, Lahore references. | Approved Chulimaar logo, founder-led Skardu narrative, culinary oil focus. |
| Header | Shop, Gifting, Story, FAQ and cart. | Our Oil, Our Process, Our Story, FAQs and Get Launch Updates. |
| Hero | “Pressed this morning. Bottled by noon.” Reads featured products, hero media and live batch information. | Supplied Skardu headline, preparation-stage copy, authentic photograph and two section links. |
| Product section | Featured products with prices, pack size and daily availability. | One product introduction with confirmed information only. |
| Process | Animated juice bottle, Punjab sourcing, exact morning timings and ice packing. | Three photo-led stages describing the actual process being prepared in Skardu. |
| Story | Punjab growing seasons and a changing juice range. | Founder portrait, Balti naming context and personal production plans. |
| Gifting/reviews/reels | Gift-box promotion, testimonials and a video feed. | Replace with signup and FAQs; a genuine founder/process video can appear in the story section. |
| Main conversion | Add to cart and checkout. | Email signup with genuine persistence, validation and success/error states. |
| Footer | Juice categories, Lahore delivery, COD/transfer and existing Taazo contacts. | Confirmed Chulimaar contacts/social links, section links and privacy. |
| SEO and icons | Taazo title, domain fallback, juice keywords, wordmark icons and commerce sitemap. | Chulimaar metadata, approved domain, new sharing image/icons and a minimal public sitemap. |
| Admin/data | Product, order, delivery, content and admin models. No subscriber model found. | Preserve existing records and authentication; add a small launch-signups area. |

## Page blueprint

Page sequence: **Header -> Hero -> Our Oil -> Our Process -> Our Story -> Launch Signup -> FAQs -> Footer.**

### Header

Use the latest approved Chulimaar logo. The repository currently contains the Taazo wordmark; no Chulimaar logo file was found in the inspected assets. The final logo is an implementation input, not something to reconstruct from the Taazo paths.

| Label | Destination |
|---|---|
| Our Oil | `/#our-oil` |
| Our Process | `/#our-process` |
| Our Story | `/#our-story` |
| FAQs | `/#faqs` |
| Get Launch Updates | `/#launch-updates` |

Retain the existing compact-menu foundation and Escape-to-close behaviour. Give the logo enough width to be readable. Use a clear ivory header with brown controls, account for the sticky header when navigating to a section and close the mobile menu after a selection.

### Hero

Headline: **Rooted in Skardu. Pressed in Skardu.**

Proposed supporting copy: “Chulimaar is a founder-run apricot kernel oil brand from Skardu, created with cooking in mind. We're preparing to press our first batch here, personally, and share it with your kitchen.”

Add a small **Preparing our first batch** label so the supplied headline is understood as the brand's intended production location rather than evidence of completed production.

Buttons: **Get Launch Updates** links to the form; **Meet the Founder** links to the story section.

Use an authentic production-location or preparation photo until the real bottle and label are ready. Then replace it with the proposed warm kitchen photograph featuring the actual bottle, apricots and kernels. Do not present invented packaging as the final product.

Keep the headline, preparation status and primary button reachable in the first mobile screen without an oversized photograph pushing them far down the page.

### Our Oil

Heading: **Apricot kernel oil, for your kitchen.**

Use two columns on desktop, stacked on mobile. Proposed introduction: “We're starting with one product: apricot kernel oil for cooking. Our first batch is being prepared in Skardu, where we plan to press the oil ourselves.”

At first, publish the product identity, culinary focus, planned production location and preparation status. Add ingredient composition, extraction method and sizes only after confirmation. There is no price block, quantity selector, stock counter or purchase button in this stage.

Keep skin and hair uses out of this section. Ingredient purity, cold pressing, organic status, smoke point, specific cooking methods and health effects must not be inferred from the product name.

### Our Process

Heading: **From kernel to bottle.**

Use three real photographs with short captions rather than the existing pinned juice-bottle animation.

| Stage | Pre-launch content | Update after production |
|---|---|---|
| The kernels | Actual sourcing/preparation photographs and confirmed selection plans. Source location stays unpublished until established. | Document the kernels used in the first batch and their preparation. |
| The pressing | Actual equipment/location and a description of what the founder is preparing to do. | First-batch footage and confirmed extraction method. |
| The finished bottle | Explain that bottling and packaging are being finalised. Use preparation photography if no finished bottle exists. | Show actual filtering, bottling, label and batch identification where used. |

Use preparation language consistently. Avoid importing the current site's “no heat,” morning production times, refrigeration and batch promises.

### Our Story

Heading: **A name from our language. A business from our roots.**

Proposed founder draft: “I'm from Skardu. Chulimaar is the Balti name we use for apricot oil, and it connects this business to my language and roots. I'm starting with one product and preparing to press the oil myself in Skardu.”

Add the founder's real name and approved introduction, a real portrait and, when available, a short video from the production location. Use a poster image and user-controlled playback. Keep this section personal and factual rather than adding an invented family or farming history.

### Launch Signup

Heading: **Be first to hear about our first batch.**

| Field | Requirement |
|---|---|
| Email address | Required |
| First name | Optional |
| City | Optional |

Button: **Notify Me at Launch**.

Form explanation: “Sign up for Chulimaar launch updates. We'll email you when our first batch is ready and ordering details are confirmed.” Link the privacy policy beside this explanation. Provide a way to leave the list in future updates.

Success after persistence: “You're on the list. We'll email you when our first batch is ready and orders open.”

For a storage failure: “We couldn't save your signup. Please try again.” Preserve entered values. For a repeat email, show a clear, non-error acknowledgement without creating a second active subscriber. The form must not report success merely because an animation completed or an email was printed to the development console.

### FAQs

Publish confirmed answers and honest preparation status. Keep a private editorial checklist for answers still awaiting product specifications.

| Question | Safe initial treatment |
|---|---|
| What does Chulimaar mean? | “Chulimaar is the Balti name we use for apricot oil.” Based on the founder's supplied wording. |
| Where will the oil be pressed? | “We plan to press our oil ourselves in Skardu.” |
| What ingredients does it contain? | Publish after ingredient composition is confirmed. |
| How is it extracted? | Publish after the actual extraction method is established. |
| What culinary uses is it suitable for? | State cooking is the primary intended purpose; add specific uses after product suitability is confirmed. |
| How should it be stored? | Publish confirmed instructions that match the final product label. |
| When will orders open? | “We're preparing our first batch. Sign up to hear when orders open.” |
| Where will delivery be available? | “Delivery areas will be announced before orders open.” |

Use an accessible accordion or simple question-and-answer layout. Preparation-status answers should not become unsupported launch promises.

### Footer and privacy

Use the logo/name, a short Skardu line, section links, confirmed email/contact channel and real social links. Do not carry the existing Taazo WhatsApp number into Chulimaar without confirmation. Omit unconfigured social icons rather than linking to placeholders.

Rewrite the existing privacy page to describe email signup, optional name/city, its purpose, storage/provider access, retention decision and how to request removal. Its current text only describes orders and claims that nobody else outside Taazo sees data; that does not describe the proposed signup/email workflow.

## Design application

| Token | New value/use |
|---|---|
| Main background | Warm ivory `#F8F4EA` |
| Headings/body | Deep brown `#432A1E` |
| Accent | Apricot orange `#DF8746` for highlights and restrained details |
| Secondary accent | Olive green `#697044` for restrained secondary details |
| Primary buttons | Deep brown fill, ivory text |
| Headings | Readable elegant serif |
| Body | Simple sans-serif; the existing Outfit integration can be retained if approved visually |
| Layout | Spacious, mobile first; clear reading widths and large real photographs |
| Mountain outline | One restrained use where it helps express place; no repeated full-logo decoration |

Add storefront-specific semantic tokens so public rebranding does not inadvertently reduce contrast or change operational admin screens. Use deep brown for small text and critical controls; verify accent combinations rather than assuming every palette pairing is readable.

Keep useful existing containers, focus treatment, skip link and button foundations. Prefer native scrolling, subtle optional reveals and reduced-motion support. Avoid loading the juice process animation, cart or smooth-scroll dependencies on the pre-launch page.

## Signup implementation plan

Reuse the existing database and protected admin foundation, but add a dedicated LaunchSubscriber record. Suggested fields: ID, unique normalised email, optional first name/city, status, signup timestamp, source and the version/time of the signup-purpose notice. Add confirmation/removal fields if those flows are implemented.

The signup action should validate on the server, trim inputs, enforce length limits, deduplicate emails and apply rate limiting/spam protection. Store the record first. Any optional acknowledgement email is a separate operation; notification failure must not lose or duplicate the subscriber.

The current mailer defaults to logging in development and hardcodes a Taazo sender for live delivery. Configure a verified Chulimaar sender before using it for real messages. Signup collection and bulk-email delivery are separate capabilities; this blueprint does not send launch emails or authorise an automatic broadcast.

Add a small protected admin screen with subscriber count, signup date, optional city and export. Keep contact information out of public responses and routine logs. A minimal count of signup attempts/successes can help evaluate the page without placing email addresses in analytics events.

## Routes and dependencies

Public pre-launch routes: `/` and `/privacy`. Header links use homepage anchors. Keep `/admin` protected, with a subscriber view.

Replace the homepage's catalogue/live-batch reads with approved editorial content and image assets. Public page rendering should work when no product, price or batch has been configured. Only the signup write requires the database.

Remove cart/checkout from the public navigation and layout. Also gate commerce pages and order-creation actions while pre-launch is active; hiding links alone leaves direct checkout URLs usable. Keep old code and records for later adaptation.

For old informational URLs such as `/story` and `/faq`, redirect to the matching homepage sections where appropriate. Show a clear pre-launch response for commerce URLs. If the Taazo deployment already serves real customers, preserve any required legacy order-tracking/support access before applying route restrictions; actual production usage has not been established here.

Update sitemap, robots references, canonical base URL, site titles, descriptions, Open Graph image, favicons and app icon. The current URL fallback is `https://taazo.pk`; the Chulimaar domain must be supplied. Publish brand-level structured information only where confirmed. Product offers, prices and stock markup wait until sales begin.

## Implementation map and order

| Order | Existing locations | Planned work |
|---|---|---|
| 1. Brand/assets | `src/components/brand/Wordmark.tsx`, `src/lib/site.ts`, `public/` | Approved logo and confirmed contacts; consistent Chulimaar naming. |
| 2. Design/layout | `src/app/globals.css`, `src/app/layout.tsx`, `src/app/(site)/layout.tsx` | Palette, serif/sans pairing, simpler public shell and cart-free layout. |
| 3. Page sections | `src/app/(site)/page.tsx`, `src/components/home/` | Hero, oil, process, founder, signup and FAQ sections. |
| 4. Navigation/footer | `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `WhatsAppFloat.tsx` | Anchor navigation, launch CTA, compact mobile menu and confirmed contacts. |
| 5. Signup | `prisma/schema.prisma`, new signup action/form, protected admin view, `src/lib/mailer.ts` | Durable subscribers and honest form states; approved sender configuration if emailing. |
| 6. Route/content cleanup | Existing site routes, checkout actions, metadata, sitemap, icons and privacy page | Pre-launch gating and consistent branding across direct URLs and search previews. |
| 7. Verification | App, database and rendered desktop/mobile pages | Verify the page and actual signup flow before publishing. |

Read the relevant installed Next.js guides in `node_modules/next/dist/docs/` before coding, as required by the repository's AGENTS.md.

## Inputs and launch gates

Assets needed to polish this page first: approved logo, founder name/introduction/portrait, authentic preparation and equipment photographs, business contact details and domain. A real storage destination and reviewed signup-purpose/privacy copy are required before collecting signups.

Final bottle design, ingredient specification, extraction method, sizes, prices, stock, culinary/storage instructions and delivery arrangements are required before enabling orders. They do not prevent publishing a truthful preparation-stage introduction.

Pre-launch acceptance checks:

- No visible Taazo, Lahore juice, fabricated price, stock or same-day delivery promises in the new public journey.
- Every header/hero link reaches its correct section; mobile menu and sticky-header offsets work.
- Valid signup persists across a reload and appears only in authorised admin access; repeated email does not create duplicates.
- Invalid email, optional blank fields, rapid repeats and database failure receive useful states.
- Privacy and contact details match what is actually configured.
- Layout is inspected on phone and desktop; controls work by keyboard, text remains readable and reduced motion is respected.
- Build, lint and type checks pass. Public metadata and sitemap contain the intended Chulimaar routes/domain.

## Move from pre-launch to sales

When the first batch and commercial details are ready, add a dedicated apricot oil product page and adapt checkout for the actual stock, city coverage, shipping and payment rules. Correct the existing checkout's server-pricing and stock-reservation issues before reuse.

Then change the main CTA to **Shop Apricot Oil**, show actual sizes/prices, update process footage and culinary/storage details, publish confirmed delivery answers and add purchase-related metadata. Keep the founder and process story. Retain the signup capability only with clear copy about the updates it now provides.

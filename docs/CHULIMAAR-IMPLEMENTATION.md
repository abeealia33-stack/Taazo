# Chulimaar pre-launch implementation

The public website is now a single Chulimaar introduction with an email signup. Existing catalogue, orders, admin accounts and commerce code are preserved. Public shopping routes redirect to launch interest and checkout/corporate actions reject writes while `PRELAUNCH` is true.

## Run locally

1. Keep the existing `.env` database and auth settings. Do not reseed or reset the database.
2. Run `npm run prelaunch:setup` to add the subscriber indexes, regenerate Prisma and configure automatic expiry of signup attempt counters.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Open `/admin/launch` with the existing owner account to view signups and download CSV. No broadcast emails are sent.

`npm run prelaunch:check` runs integration checks in a new isolated **local-only** MongoDB test database and cleans up only that test database. It checks duplicate signup, concurrent signup, validation, stock-independent signup, private removal and the checkout guard.

## Website editor

Open `/admin/website` as an owner, or choose **Website** in the admin navigation. During pre-launch the old `/admin/content` screen redirects here. Select Header, Hero, Product, Process, Founder, Launch signup, FAQs or Footer. Edit the text, upload or remove photographs, adjust alt text/captions/crop focus, then choose **Save changes**. Saves publish to the public homepage immediately; switching editor sections keeps unsaved edits. FAQs can be added, removed and reordered. Contact and social links are under Footer; blank channels are hidden, and the contact email also appears on the privacy page.

The editor opens on **Photos & banners**, showing all six slots together: Hero banner, Founder portrait, Product photograph, Kernel photograph, Pressing photograph and Bottling photograph. Empty slots have visible image placeholders with their planned aspect ratios, suggested pixel dimensions, subject guidance and an **Upload image** button. Existing images have **Replace image** and **Remove image** controls. These same photo cards appear above the text in each corresponding section. Uploading previews an image; **Save changes** publishes it. This does not add empty photo frames to the public page.

The photo gallery was reviewed at 1440px desktop and 390px mobile without horizontal overflow. All six upload buttons were enabled for the owner; the Founder editor showed its portrait placeholder first and Process showed three separate photo cards. Production build, TypeScript, targeted lint and existing content integration checks passed. Screenshots are saved as `docs/previews/chulimaar-admin-photos-*.jpg` and `chulimaar-admin-founder-upload.jpg`.

The existing `Setting` collection stores one validated JSON document at `chulimaar.homepage.v1`; no new database model or catalogue reseed is needed. Current copy and environment photo/contact references provide defaults until the first save. After a save, the saved document is authoritative, including intentionally blank image and contact fields. Public reads share a bounded lookup and use the last good process-local content or original defaults if MongoDB is unavailable. Owner login and editing still require the configured database to be running.

Photo uploads accept JPEG, PNG, WebP and AVIF up to 8MB, decode and resize to a maximum 2200px dimension, and save WebP through the existing local/Vercel Blob storage adapter. Replacement/removal does not delete the original image. The upload sweeper preserves all saved homepage images and gives new unpublished homepage uploads a 24-hour grace period. Save validation, owner checks, audit records and revision checks prevent invalid content and stale-tab overwrites. The brand logo and favicon remain part of the shared identity; signup validation, consent and private removal links remain part of the application.

CMS verification used a disposable MongoDB replica set on `127.0.0.1:27019`, database `chulimaar_cms_qa`, and a separate preview on port 3006. `scripts/check-homepage.ts` verifies validation, persistence, public reads, photo removal, audit records and concurrent/stale saves; `scripts/check-homepage-http.ts` verifies owner access, staff/anonymous denial, request origin, invalid images, real WebP uploads and public rendering. Both refuse the normal database. Browser checks confirmed an admin text save appearing on the public test page, FAQ reordering, and a 390px editor without overflow. Browser automation of the local file chooser was blocked by the Chrome extension's file-access setting; actual upload/storage was verified through the authenticated HTTP endpoint. Test services and data are cleaned up afterward. The normal MongoDB service and the earlier requested existing-account credential update remain pending.

## Logo assets

The shared `Logo` component supports horizontal, stacked and icon variants with full-colour, reversed and monochrome tones. It pairs the supplied apricot/ridge paths with outlined Georgia lettering matching the website's title-case **Chulimaar.** wordmark. The source attachment is preserved in `public/chulimaar/brand/source.svg`; its original all-caps lettering is not used by the new components. Photo spaces remain designed and labelled; no placeholder photography is presented as the founder, product or actual equipment.

Run `npm run brand:prepare` to regenerate the twelve SVG exports, Apple home-screen icon, social-profile image and the specimen sheet in `docs/previews/`. The browser favicon uses the apricot symbol alone on a transparent background in `src/app/icon.svg`, regenerated with the brand assets. All artwork and layout come from `src/lib/brand-system.ts` and the checked-in outline data. `scripts/export-chulimaar-wordmark.ps1` can regenerate lettering on Windows with Georgia installed; no font binary is shipped with the logo assets. Horizontal and stacked exports include clear space. Monochrome components use `currentColor`, while standalone mono-brown/mono-cream exports include their ink colour explicitly.

The header uses a 36px apricot beside the wordmark (approximately 32px on mobile). The hero keeps the cream text column and a substantial image area. No suitable photographs were available: `public/chulimaar/apricot-study.svg` is an explicitly labelled illustration, selected by `HERO_ILLUSTRATION` in `MediaPanel.tsx`. Replace it by configuring `CHULIMAAR_HERO_PHOTO` and matching `CHULIMAAR_HERO_PHOTO_ALT`; the image uses a centred cover crop. No finished bottle or packaging is invented. Missing product, process and founder photographs are omitted in favour of compact text layouts.

The footer uses the full-colour stacked logo on warm sand `#EDE2CF`, reduced from 260px to 200px on desktop and 240px to 184px on mobile, with the description aligned to its visible lettering. Signup uses pale apricot `#F3DFC9` and an ivory `#FDFCF6` form card. Primary buttons remain brown with cream text; the desktop header CTA is outlined. Public colours retain cream `#F7F2E7`, brown `#542912`, orange `#DC803F` and leaf olive `#737745`. Section and divider spacing is reduced by roughly 20–30%, with single-column footer groups on mobile. Internal scroll actions use downward arrows, form submission a right arrow, and external social links diagonal arrows.

Add approved files under `public/chulimaar/`, then configure the following server environment variables with local paths such as `/chulimaar/founder.jpg`:

- `CHULIMAAR_HERO_PHOTO`
- `CHULIMAAR_HERO_PHOTO_ALT` (describe the selected photograph)
- `CHULIMAAR_OIL_PHOTO`
- `CHULIMAAR_KERNELS_PHOTO`
- `CHULIMAAR_PRESSING_PHOTO`
- `CHULIMAAR_BOTTLE_PHOTO`
- `CHULIMAAR_FOUNDER_PHOTO`

Use photos matching their section subjects. Review the alt text against the supplied photographs. Restart the server after environment changes.

Set `CHULIMAAR_SITE_URL` to the approved HTTPS domain before deployment. The fallback is local development, never a guessed Chulimaar domain. Configure `CHULIMAAR_CONTACT_EMAIL`, `CHULIMAAR_INSTAGRAM_URL` and `CHULIMAAR_WHATSAPP` only when confirmed. Unconfigured channels are omitted. WhatsApp uses digits in international format.

Headings use Georgia; body uses the existing self-hosted Outfit integration. The logo's vector lettering uses the same Georgia source and tracking. Public CSS is scoped with `cm-` classes so the operational admin palette remains stable.

## Signup behaviour

- Required email, optional first name/city, server validation and a honeypot.
- Normalised email is unique. Concurrent duplicates acknowledge the signup without duplicating records or exposing an existing subscriber's removal token.
- Database-backed rate counters apply per email. To also limit by IP, set `CHULIMAAR_TRUSTED_IP_HEADER` only if the hosting proxy overwrites that header. Otherwise leave it empty.
- Run setup to create the counter's TTL index. The limiter fails closed when the database is unavailable and shows an honest error.
- A new signup returns a private removal link. The database stores only its hash. Removing a signup requires an explicit POST with that token; viewing the link does not delete anything.
- The owner-only subscriber screen is paginated; the protected CSV export streams batches and escapes spreadsheet formulas.
- The privacy page describes the implemented data collection. Confirm business contact details and the retention/removal operating procedure before public launch. Every future launch broadcast needs an unsubscribe mechanism using the stored removal hashes or an email provider's suppression system. Do not start bulk email delivery merely by setting the old Resend key.

## Release checks and future sales

Run lint, TypeScript, production build and integration checks. Inspect the page in a browser at phone and desktop sizes, test anchors/menu/FAQ/form states, and verify privacy and sharing previews. No first-batch, price, purity, extraction or delivery details are invented.

Legacy `/track` remains accessible for historical order support and is excluded from the sitemap and search indexing. Old `/story`, `/faq`, `/contact` and `/reels` URLs redirect to relevant homepage sections. Existing admin order tools remain available at their direct routes.

Before enabling commerce, adapt the product model, stock and delivery rules; fix the existing gift-price/stock/reservation issues identified in the blueprint. Changing `PRELAUNCH` alone does not make the legacy juice storefront suitable for selling oil.

## Warm visual refresh — 15 October 2026

Production build (including TypeScript), ESLint and diff whitespace checks passed. Browser review covered 1440px desktop, 768px tablet, 390px phone and 320px narrow phone, with no horizontal overflow. Verified the centred hero crop, mobile image order, sand footer and stacked groups, launch menu link, Escape/focus return, and mouse/keyboard FAQ toggles. Supporting text contrast is at least 4.79:1 on the new surfaces; primary button contrast is 11.05:1. Existing reduced-motion rules remain active.

Required and malformed email checks passed in the browser. A real submission against the stopped local MongoDB service displayed the existing error and retained the entered email. Successful persistence and success/removal states were not re-run during this visual update; the action, validation schema, consent text and success/error logic were preserved. The earlier isolated integration results below remain historical verification, not evidence that the normal local database is currently running.

Still needed: an authentic hero photograph of apricots/kernels or the Skardu setting; then approved product/packaging, process photographs and a founder portrait when available. Add them using the references above. Current previews are in `docs/previews/chulimaar-warm-*.jpg`.

## Verification on 14 October 2026

Production build, ESLint and TypeScript passed. Isolated MongoDB integration checks passed for validation, persistence, concurrent/duplicate signups, removal and atomic rate limits. Browser checks covered desktop and 390px mobile layouts, menu/anchor navigation, FAQ expansion, a saved signup and private removal. An authenticated owner HTTP check verified the subscriber table and CSV export; unauthenticated export returned 403. With the database offline, the form showed a real error and retained entered values.

The original MongoDB Windows service was stopped. This session could neither start that service nor open its protected log file to run the installed server directly. The existing database was not reset or reseeded. Successful signup/admin checks used a separate temporary MongoDB replica set and disposable test data. Start the normal MongoDB service as administrator and run `npm run prelaunch:setup` to activate signup persistence against the configured database.

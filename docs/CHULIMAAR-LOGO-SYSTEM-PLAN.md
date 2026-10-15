# Chulimaar logo system and banner integration

Implemented: the current pre-launch page now uses this logo system, updated colour tokens, branded hero artwork, restrained dividers, outlined header CTA and reversed stacked footer. See `CHULIMAAR-IMPLEMENTATION.md` for asset regeneration and configuration.

## Direction

Keep the existing title-case **Chulimaar.** wordmark, its light serif character and orange period. Pair it with the apricot, leaf and hand-drawn ridge from the supplied vector. Retire the supplied all-caps lettering from the new website logo system.

Preserve the current homepage structure and hero grid. The update refines branding, illustration, colours and CTA hierarchy rather than rebuilding the page. Signup behaviour and pre-launch product claims remain as implemented.

The original supplied vector should remain available as the source master. New artwork is a derivative: reuse its shapes, clean the canvas and normalise approved colours without stretching the mark or inventing a replacement mountain range.

## Source check and proposed tokens

The attachment's SVG directly confirms orange `#DC803F`, leaf green `#737745` and background cream `#FDFCF6`. It contains several brown shades, including `#542912`; that value becomes the canonical brand brown. The current website actually uses `#F8F4EA` for its background, rather than `#F7F2E7`.

| Token | Current website | Planned value/use |
|---|---|---|
| Page cream | `#F8F4EA` | `#F7F2E7`, the proposed warmer page background |
| Logo/light plate | Supplied SVG: `#FDFCF6` | `#FDFCF6`, used consistently where a light plate is needed |
| Kernel brown | `#432A1E` in the site; several shades in the SVG | `#542912` for headings, body, buttons and dark sections |
| Apricot orange | `#DF8746` | `#DC803F` for the apricot and wordmark period |
| Leaf olive | `#697044` | `#737745` for the leaf and preparation-status dot |
| Hero sand | Several existing radial/linear gradient colours | `#E8DDCB` to `#E5B77F` |

Keep secondary text, borders, hover and focus colours as derived supporting tokens. Verify contrast before changing them. Orange and olive remain accents; small text and important controls use brown on cream or cream on brown.

The current display family is Georgia with serif fallbacks; body text uses Outfit. Preserve that display appearance in this task. Wordmark lettering and headlines must match. Freeze the lettering from one approved font source for exported logos, rather than letting the share image or packaging silently use a different fallback. Use outlined wordmark lettering in final vector exports so it remains consistent across applications.

## Three logo versions

| Version | Composition | Planned applications |
|---|---|---|
| Horizontal | Apricot/leaf symbol beside **Chulimaar.**, with no ridge | Desktop header, mobile header/menu and compact admin branding |
| Stacked | Hand-drawn ridge behind apricot/leaf; **Chulimaar.** underneath | Footer, share image, social profile and future packaging/story applications |
| Icon | Simplified apricot/leaf silhouette; no ridge or lettering | Favicon and home-screen icon; small brand details where useful |

Maintain one shared set of symbol paths. The website wordmark must retain its current title-case proportions and orange period across horizontal and stacked versions. Do not import the original heavy all-caps letters into either version.

The icon gets optical adjustment for 16px: remove tiny highlights, avoid hairline details and preserve an understandable apricot silhouette. Keep the central kernel/drop shape only where it remains legible. Compare 16px and 32px exports before choosing the final favicon; shrinking the full stacked mark is insufficient.

## Colour modes

| Tone | Treatment |
|---|---|
| `color` | Brown wordmark/ridge, orange apricot, olive leaf, orange period, on a cream field |
| `reversed` | Cream wordmark/ridge with orange apricot and its approved contrasting kernel treatment, on brown |
| `mono` | One ink across all artwork and lettering, with open negative spaces preserved; brown or cream as required |

The orange period is exclusive to wordmarks. Standalone icons, preparation-status dots and decorative marks do not gain an extra orange period. In a one-ink export, the period uses the same ink as the lettering; its position remains recognisable.

Keep separate SVGs for each version and tone family: nine core assets. Where both monochrome inks are needed for external printing or export, supply separate `mono-brown` and `mono-cream` files rather than expecting an image file to inherit a page's CSS colour. That produces twelve standalone exports when both inks are included.

A single accessible `Logo` component selects the correct version and tone. Planned API:

```tsx
<Logo variant="horizontal" tone="color" />
<Logo variant="stacked" tone="reversed" />
<Logo variant="icon" tone="mono" />
```

Any monochrome ink selection must be explicit in the component or surrounding style. Inline monochrome artwork can use `currentColor`; externally referenced SVG images cannot inherit the parent's text colour. Give linked logos the accessible name “Chulimaar home”; hide purely decorative repeats from assistive technology.

## Banner and site placement

### Header

Replace `Brand.tsx`'s standalone text treatment with the horizontal logo. Use a 36px apricot symbol on desktop and 32px on mobile. Keep the existing header structure and compact menu, with the wordmark readable at both sizes.

Make the desktop **Get Launch Updates** button outlined and slightly shorter, around 40–44px. The hero CTA stays filled brown and approximately 52px tall. Keep the existing mobile-menu CTA and avoid adding another fixed mobile button.

A header logo will typically need roughly 180–220px of visible width; the 100px minimum is a fallback floor, not the preferred header size. Include clear space when checking the menu's available width at 320px and 390px.

### Hero left

Keep the supplied headline, preparation status and current supporting message. Add no logo here. Keep the main filled CTA and the quieter founder link. Use the exact leaf olive for the status dot.

### Hero right

Replace the generic thin zigzag in `MediaPanel.tsx` with the supplied hand-drawn ridge and apricot artwork. This is an illustration using shared logo artwork, without another wordmark.

Remove **“A beginning in Skardu.”** from this panel. Replace the top **“Skardu, Pakistan”** label with **“Our first batch”** or omit it. The headline then carries the location message without the panel repeating it twice.

Keep a short factual caption, such as **“Preparing our first batch. We'll share the work as it takes shape.”** The illustration should not imply that final packaging, equipment or a batch photograph already exists.

When authentic photographs arrive, the photo becomes the main content. A ridge-only watermark is optional, confined to a quiet area and low opacity; omit it if it interferes with the subject. Full logos stay on cream or brown plates rather than directly over busy photography.

### Dividers

Use a small, one-colour apricot centred on a hairline rule in at most two deliberate transitions: after the hero and before the founder story. Do not add a logo to every section. Maintain the symbol's clear space by leaving a gap in the rule around it.

### Footer

Change the footer to canonical brown and use the reversed stacked logo, approximately 200–240px wide. Set footer text, links and separators to readable cream tones. Verify the stacked logo plus its clear space fits the mobile content width; allow it to sit above the footer link columns.

### Sharing and small icons

Replace the text-only branding in `opengraph-image.tsx` with the stacked logo on an appropriate plate, keeping the pre-launch message legible in a 1200×630 preview. Prepare a square social export with sufficient inset to survive a circular profile crop.

Replace the temporary “C” icons with the simplified apricot symbol: orange on cream at 16/32px, and a larger home-screen export. Do not add a loader or other new UI merely to create another icon placement.

## Clear space and size rules

Use the displayed height of the kernel/pit as the clear-space unit. Define it in each master and preserve it around logos, against navigation, image edges and other text. Transparent canvas padding is part of the layout calculation, not a reason to stretch the artwork.

Minimum visible widths: stacked 120px, horizontal 100px, icon 16px. Preferred website sizes are larger where the layout allows. If the ridge is unreadable at the target size, use the horizontal or icon variant rather than thickening the complete logo arbitrarily.

Only approved colour modes may recolour the artwork. No squashing, unapproved effects, busy-photo placement or repeated full-logo background patterns.

## File-by-file implementation sequence

| Stage | Current locations | Planned work |
|---|---|---|
| 1. Prepare master artwork | Supplied attachment; new `public/chulimaar/brand/` assets | Preserve the original, isolate ridge/symbol, rebuild title-case lockups, create approved tone exports and small icon |
| 2. Shared components | `src/components/prelaunch/Brand.tsx`; new `Logo.tsx` and shared artwork component | Route logo usage through the variant/tone API; use the same paths for the hero illustration |
| 3. Tokens/header | `src/app/globals.css`, `Header.tsx` | Canonical colours, horizontal logo sizing, outlined header CTA and clear-space rules |
| 4. Hero/dividers | `MediaPanel.tsx`, `src/app/(site)/page.tsx` | New ridge/apricot artwork, reduced location repetition and two restrained dividers |
| 5. Footer/admin | `Footer.tsx`, admin navigation/login branding | Reversed stacked footer, readable links and compact horizontal admin logo |
| 6. Metadata assets | `icon.svg`, `apple-icon.png`, `opengraph-image.tsx` | Correct small symbol and consistent share branding |
| 7. Visual verification | Browser and exported assets | Inspect desktop/mobile, colour modes, small icons and share image before considering the update complete |

Read relevant installed Next.js guides before implementation. Preserve the signup and privacy flows while updating visual tokens.

## Review and acceptance

First review one specimen showing horizontal, stacked and icon versions in full colour and reversed tones. Place the horizontal and hero artwork in a screenshot of the existing banner so scale can be assessed together before wiring every asset.

Then verify:

- One title-case wordmark everywhere, with no all-caps counterpart in public branding.
- Apricot 32–36px in the header, readable wordmark, working menu and no overflow at 320px/390px.
- Existing hero grid and headline hierarchy preserved; filled hero CTA dominates the outlined header CTA.
- Hand-drawn ridge replaces the generic zigzag; the right panel no longer repeats the location in a heading and label.
- Footer and signup text/focus states remain readable after token changes.
- Small symbol is recognisable at actual 16px/32px, and reversed/monochrome marks preserve negative spaces.
- The share image uses the same lettering and loads successfully.
- Build, lint and type checks pass after code changes.

The implementation follows this specification. Assets include separate monochrome brown and cream exports; compact favicon artwork uses an optical inset for legibility while horizontal/stacked lockups include clear space.

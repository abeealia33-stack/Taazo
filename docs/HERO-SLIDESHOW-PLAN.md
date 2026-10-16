# Full-screen hero slideshow plan

Status: implemented on 16 October 2026. The design below records the agreed behavior.

## Public homepage

Replace the current two-column hero and square photo with an edge-to-edge photographic banner. Keep Chulimaar's cream header, serif typography, warm brown/orange palette, existing headline, and calls to action.

- The header and hero together fill the first visible screen. The image fills all available width and the remaining viewport height below the header; the following section begins after the first screen. Use the stable mobile viewport height so browser toolbar changes do not make the banner jump. Allow additional height when large text or a short landscape screen needs it.
- Display photos with cover cropping. A soft ivory gradient behind the text blends into the photograph, matching the supplied reference. Position the main subject toward the right on desktop, leaving space for the copy on the left.
- Keep the existing headline, description, and buttons stationary while photos change. Use warm brown text, a brown primary action with cream lettering, and an underlined secondary action. Preserve editable hero copy in Page content. On mobile, fade the image into an ivory background beneath the copy.
- On phones, use a full-width image with the copy toward the lower part of the banner, comfortable side padding, and stacked buttons when necessary. Each slide has a separate mobile focal position so its subject remains visible.
- Place previous/next controls and slide indicators near the bottom, with a visible pause/play control. Controls have readable labels, keyboard access, and generous touch targets. Hide slideshow controls when there is only one enabled image.
- Keep a restrained scroll cue to the next section. Move the existing origin/product strip below the full-screen hero.

Suggested image sequence: a Skardu orchard, apricot kernels or pressing, then a close-up of the oil bottle. Real brand photographs should drive the final selection. Recommend 3–5 images, maximum 6. Prefer landscape images around 2200 × 1400 pixels with room for cropping; portrait images remain accepted with a crop preview.

## Motion

- Default to a smooth 800 ms crossfade every 6 seconds. No sideways movement of the headline or buttons.
- Fade between images only after the next image has loaded. Keep the current image visible if the next image fails.
- Pause automatic rotation while the pointer is over the banner, keyboard focus is inside it, or the browser tab is hidden. Keep an explicitly paused slideshow paused; after manual slide navigation, leave it paused until the visitor chooses Play.
- Respect reduced-motion preferences: automatic rotation is off, manual image changes are immediate, and decorative motion is disabled. Do not announce automatic slide changes repeatedly to screen readers.
- Use one subtle entrance for the hero copy; do not replay it on every slide. Avoid zoom effects in the initial version so photographs and text feel calm.

## Admin: Website → Photos → Hero slideshow

Replace only the current Hero banner photo card with a slideshow card showing its cover thumbnail, image count, and Manage slides button. The other five photo cards keep their current behavior.

The slideshow manager contains:

1. An Add images button supporting multiple file selection and drag-and-drop. Accept the existing JPEG, PNG, WebP, and AVIF formats, up to 8 MB per file. Upload sequentially with progress and a clear result for each file; a failed upload must not discard successful ones.
2. An ordered thumbnail list. The first enabled image is the starting slide. Reorder by dragging or by accessible Move up/Move down buttons.
3. An editor for the selected slide: replace image, descriptive alt text, desktop focal position, mobile focal position, enable/hide, and remove from slideshow. Removing a slide changes the draft and does not immediately delete its stored image.
4. A Desktop/Mobile preview that uses the real headline, gradient, image crop, and controls. Mark it as a draft preview.
5. Shared settings: automatic rotation on/off and image duration (4–10 seconds, default 6). Keep the fade duration fixed at 800 ms for a consistent design.
6. A clear Done button returning to Photos. The existing Save changes bar publishes the entire draft. Uploading or closing the manager alone does not publish changes. Preserve the existing unsaved-change protection and concurrent-edit conflict handling.

Show actionable inline messages for unsupported files, oversized files, missing alt text, upload failures, and the six-image limit. Prevent publishing a configured slideshow with no enabled image; explain how to enable or add one.

## Content and storage

- Introduce a dedicated ordered hero slide collection with stable slide IDs, stored image reference, alt text, desktop/mobile focal positions, and enabled state, plus shared slideshow settings.
- Normalize existing saved content when reading it: a populated current hero photo becomes slide 1, preserving its URL, alt text, and crop. Keep all other text, photos, FAQs, and contact data intact. Do not require the owner to upload an existing image again.
- If the site has no hero image yet, show a polished branded background with the existing copy and a photo placeholder in admin. Do not render a broken image or an empty public banner.
- Reuse the working owner-only upload API and durable Atlas image storage. Keep image data out of Git and retain references across Hostinger deployments.
- Load the first image promptly, prepare the next image before transition, and defer remaining images. Use responsive image sizes; do not preload all six full-resolution photos. Reserve the banner's dimensions to avoid layout shift.
- Keep the existing authenticated save, validation, audit log, revision check, and homepage refresh behavior. Validate slide limits, unique IDs, allowed image URLs, required alt text, positions, and settings on the server.

## Acceptance checks before release

- Desktop and mobile: first screen has no side gutters, copy/buttons remain readable, subject cropping is controllable, and the next section follows cleanly. Check narrow phones, short landscape screens, large text, and browser toolbar changes.
- Slideshow: one image, several images, all controls, repeat cycling, slow/failed image loads, pause/resume, hidden tabs, keyboard use, and reduced motion behave as specified.
- Admin: upload several files, mixed success/failure, replace, reorder, hide, remove, enforce limits, edit alt/crops, preview, cancel/discard, save, and reload.
- Persistence: existing single-photo content survives the upgrade; saved images and order survive an app restart and a deployment. Two owners editing concurrently receive the existing conflict protection.
- Verify the appropriate project checks and production build, then inspect the real homepage and admin flow before publishing.

## Implementation sequence

1. Add the compatible slide data model and validation.
2. Build the full-screen responsive hero and accessible crossfade behavior.
3. Build the admin slide manager and previews using the existing upload/save flow.
4. Verify migration, uploads, responsiveness, accessibility, persistence, and build checks.
5. Publish through the existing GitHub-to-Hostinger deployment and verify the live result.

## Verification completed

The production build, TypeScript check, targeted lint and `npx tsx scripts/check-hero.ts` passed. A disposable local replica set and production-mode app were used for normal owner sign-in, reordering, mobile crop editing, publishing, required-alt validation, and checking the stored order/crop and public media delivery. Browser checks covered desktop first-screen height, 390px public layout, 320px admin layout, reduced motion, failed-image retention, single-image legacy migration, and an empty slideshow fallback. The existing owner-only upload endpoint and durable Atlas storage are reused.

# Bottle rotation assets and behavior

Implemented and reviewed locally on 17 October 2026. The owner subsequently approved pushing this release to GitHub and deploying it to Hostinger.

Presentation update: the public product visual now shows only the bottle. Its heading, rotation buttons, named view buttons, instructional text, active-view label, view counter, caption and details button are omitted. Drag/swipe and arrow-key rotation remain available; Space or Enter pauses/resumes automatic rotation, with instructions available to assistive technology. Manual interaction also stops the public floating animation. Full controls and the details viewer remain available in the admin draft preview. The behavior described below for visible buttons/viewers applies to that admin preview.

The supplied images provide three distinct perspectives: on1wX.jpg (angled front), YYUU5.jpg (side), and wCQ07.jpg (rear). IVOwn.jpg shows substantially the same rear perspective; it is not counted as another angle. The existing front cutout completes four selectable photograph views. This is an interactive four-view presentation, not a continuously photographed 360-degree sequence. No missing angles or rear labels were invented.

Drag or swipe horizontally; use the arrow controls, keyboard arrows, Home/End, or named view buttons. Automatic playback advances every 2.1 seconds while visible, with Pause/Play controls. Manual interaction stops playback. Opening the details viewer pauses playback and retains the current angle. The viewer supports all four views, zoom, fit, Escape, and return focus. Zoomed images scroll instead of rotating when dragged. Vertical touch scrolling remains available through pan-y touch action. Reduced motion disables automatic playback, floating and crossfades but leaves manual view selection available. The admin animation toggle also leaves manual angles usable.

Only the supplied bundled bottle uses these views. Owner-uploaded replacement photos keep the single-photo presentation so unrelated photos cannot receive this bottle's back and side views.

## Verification

Browser-tested actual mouse dragging (front to side), touch swiping (front to side), vertical touch scrolling without changing the selected view, keyboard rotation, named angle buttons, automatic playback and manual pause. Checked zoom/fit, Escape and focus restoration, and an enlarged viewer that fits a 320 × 568 viewport. At 390px, the page has no horizontal overflow and the controls have 44px minimum touch targets. Reduced motion retains manual controls and disables autoplay/crossfades. The isolated admin preview retains manual views when animation is disabled, and closing its nested viewer keeps the photo editor open. Production build, TypeScript, targeted ESLint and the product/hero content and gesture checks pass. Physical device testing has not been performed.

Local verification used an isolated test database. Release deployment does not require a database schema change or copying local test records into production.

## Saved assets

- public/chulimaar/product/apricot-kernel-oil-cutout.png — existing front.
- public/chulimaar/product/bottle-angled-front-cutout.png
- public/chulimaar/product/bottle-side-cutout.png
- public/chulimaar/product/bottle-back-cutout.png

All three new assets were edited using the built-in image_gen tool with transparent_background=true. Each has a verified alpha channel and a transparent exterior. Original source files in Downloads were not changed. Full cutouts use portrait 1024 × 1536 canvases; website display uses responsive Next image optimization.

## Final prompts

### back

Background extraction ONLY. Edit target is the supplied back view of the Chulimaar oil bottle. Remove all black/brown/amber backdrop and floor/reflection outside bottle to actual transparent alpha. Preserve this exact viewing angle, glass outline, wood cap, cream seal with droplet, oil and details. Keep the bottle unlabelled as in this input; do not add front label or any text. Do not rotate, mirror, change perspective, redesign, or generate another angle. Maintain portrait 2:3 canvas, same bottle scale, centered, cap and glass base fully visible with small transparent margins. No glow halo, floor, black rectangle, or baked shadow. This must be a faithful clean cutout of the supplied photograph for an angle-by-angle product viewer on a cream webpage.

### side

Background extraction ONLY. Edit target is the supplied side view of the Chulimaar oil bottle. Remove all black/brown/amber backdrop and floor/reflection outside bottle to actual transparent alpha. Preserve this exact viewing angle, glass outline, wood cap, cream seal with droplet, oil and details. Keep the bottle unlabelled as in this input; do not add front label or any text. Do not rotate, mirror, change perspective, redesign, or generate another angle. Maintain portrait 2:3 canvas, same bottle scale, centered, cap and glass base fully visible with small transparent margins. No glow halo, floor, black rectangle, or baked shadow. This must be a faithful clean cutout of the supplied photograph for an angle-by-angle product viewer on a cream webpage.

### angled-front

Background extraction ONLY. Edit target is the supplied angled-front view of the Chulimaar oil bottle. Remove all black/brown/amber backdrop and floor/reflection outside bottle to actual transparent alpha. Preserve this exact viewing angle, glass outline, wood cap, cream seal with droplet, oil and details. Preserve ALL cream label text and artwork precisely, especially CHULIMAAR, APRICOT KERNEL OIL, FOR COOKING, NATURAL | PURE | SKARDU and 250 ml. Do not rotate, mirror, change perspective, redesign, or generate another angle. Maintain portrait 2:3 canvas, same bottle scale, centered, cap and glass base fully visible with small transparent margins. No glow halo, floor, black rectangle, or baked shadow. This must be a faithful clean cutout of the supplied photograph for an angle-by-angle product viewer on a cream webpage.

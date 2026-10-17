# Interactive Chulimaar product section

Update: the supplied bottle now uses a four-view drag/swipe presentation. See [PRODUCT-ROTATION.md](PRODUCT-ROTATION.md) for current behavior, new assets and their editing prompts. The single-photo tilt described below remains the fallback for owner-uploaded photographs.

Implemented and reviewed locally on 17 October 2026. The owner subsequently approved the GitHub push and Hostinger deployment.

## Current design

The supplied bottle sits directly on the ivory page with a subtle CSS ground shadow. The original dark-backed PNG is retained; the website uses a separate transparent cutout. Product headings, copy, facts and buttons remain HTML and editable through the existing owner editor.

The bottle floats gently and tilts toward a desktop mouse. Large left/right buttons visibly tilt it on phones and keyboards too; Reset returns it to floating, and Pause stops the motion. These controls present the single frontal photo, not a 360-degree model. The bottle and its label remain fully visible. Reduced-motion preferences remove decorative motion and its controls, while details and zoom remain available. Animation pauses off screen and browsers suspend it in background tabs.

The details viewer uses the same cream palette, supports zoom/fit, scrolling, Escape, and focus restoration. The existing product facts and signup flow are preserved.

## Owner workflow

Website ? Photos ? Product photograph provides upload, alt text, caption, alignment, animation toggle, an interactive draft preview, and Use supplied bottle image. Saving affects the environment in which the editor is open. All review saves used the isolated local database; production was not changed.

Older records pointing to our bundled dark-backed bottle use the cutout on read. Custom uploaded images are preserved, and intentional image removal stays empty.

## Asset provenance

Original: `public/chulimaar/product/apricot-kernel-oil.png` (unchanged user image).
Cutout: `public/chulimaar/product/apricot-kernel-oil-cutout.png`.
Edited with the built-in image_gen tool with transparent_background=true. Alpha-channel inspection confirmed transparency. No external image-editing API or image-processing background removal was used.

Final prompt:
> Background extraction edit. Input is the exact Chulimaar apricot kernel oil product bottle to preserve. Remove ALL black, brown and amber glow backdrop outside the bottle and make it truly transparent alpha. Keep the entire single bottle intact, centered with breathing room around the cap and base. Preserve the original frontal shape, glass and oil golden color, wooden lid, cream paper seal, every label word including CHULIMAAR / APRICOT KERNEL OIL / FOR COOKING / NATURAL | PURE | SKARDU / 250 ml, apricot logo, fruit and mountain illustration and proportions. Do not redesign or add anything. Clean detailed edges, no black rectangle, no background color, no floor, no shadow baked into image. A faithful isolated product cutout for placement on a cream webpage.

## Local review

Preview: http://127.0.0.1:3026/#our-oil
Editor: http://127.0.0.1:3026/admin/website

The preview uses an isolated MongoDB database on port 27026. Local review leaves production data untouched. Pushes to main automatically deploy to Hostinger; the owner has now explicitly authorized this release.

Browser checks cover desktop and 390px/320px layouts with no horizontal overflow; 44px tap targets; left/right tilt; pause/resume; keyboard reset; reduced motion; viewer zoom/fit, Escape and focus return; and the admin animation preview and saving. Physical iOS/Android testing has not been performed. Local product and hero content checks, targeted ESLint, TypeScript and the production build passed.

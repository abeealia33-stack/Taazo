# Chulimaar admin UI redesign plan

Status: sidebar workspace implemented on 16 October 2026. The interactive
proposal remains a design reference; the application now uses the sidebar option.

## Direction

Build a calm, compact workspace around the three current tasks: editing the
website, reviewing launch signups, and managing account access. Retain Chulimaar's
warm palette and wordmark, with clearer hierarchy and less header space.

Recommended layout: **Sidebar workspace**. Alternative: **Compact header**, with
the three destinations in one horizontal row. The interactive proposal compares
both layouts and allows switching between the three screens.

## Problems to address

- The current logo/account row and separate navigation row consume too much
  vertical space before the page starts.
- Similar cream surfaces and pill-shaped controls give navigation, fields and
  primary actions insufficient visual distinction.
- The website editor adds another column of navigation and a long stack of photo
  forms. Identifying an image should be faster than reading its full settings.
- Account identity, password changes and access management need clear groups.

## Shared layout and visual system

- Desktop sidebar: approximately 208–224px, with a compact brand mark at the top.
- Navigation: Website, Launch signups, Account. Use small consistent line icons,
  a subtle warm selected background, and a visible current-page indicator.
- Owner identity sits at the bottom of the sidebar. Keep sign out as a quiet,
  clearly labelled action near the account controls.
- Top bar: approximately 64px, with page context and a View website link.
- Main content: fluid width, approximately 1200px maximum, with 24–32px padding.
- Palette: warm off-white canvas, ivory work surfaces, brown text, restrained
  apricot accents and olive success indicators. Use strong text contrast.
- Typography: retain the serif wordmark; use Outfit or the existing admin sans
  serif for navigation, tables, headings and fields. Body 14–16px, page headings
  26–30px, supporting labels at least 12px.
- Geometry: 8–12px corners for fields, buttons and panels. Reserve pills for short
  status labels. Avoid heavy shadows and repeated borders inside borders.
- Use an 8px spacing rhythm. Show one clear primary action per task.

## Website screen

1. Page heading and one primary Save changes button in a consistent position.
2. Photos, Page content and FAQs tabs, replacing the long secondary navigation.
3. Photos: six compact preview tiles, three columns on desktop, two on a phone
   when labels fit. Each tile identifies its website section and image status.
4. Manage photo opens a focused panel for the selected image: upload/replace,
   image description, caption and crop focus. Close returns to the photo grid.
5. Page content: a section selector for Header, Hero, Product, Process, Founder,
   Launch signup and Footer. Display only the selected section's fields.
6. FAQs: clear question/answer groups with accessible reorder and remove actions.
7. Keep the save control visible while working on long forms. Show explicit
   Unsaved changes, Saving, Saved and Save failed states. Preserve edits on error.
8. Upload completion and publication are separate states: a selected photo appears
   publicly only after a successful save. Reflect photo-storage availability
   honestly; durable production storage remains a deployment prerequisite.

## Launch signups screen

- Clear page title, total subscriber count and Export CSV action.
- Clean table with email, name, city and signup date. Keep technical consent
  metadata secondary, with the underlying record preserved.
- Show an intentional empty state when the list is empty.
- Preserve pagination and owner-only export access. Add search only when its
  server-side behaviour is implemented; do not show decorative search controls.
- Keep the existing statement that emails are not sent automatically.

## Account screen

- Separate Your profile, Password and Team access groups.
- Show current name, email and role clearly, without implying unsupported profile
  editing is available.
- Expand password fields only when Change password is selected. Preserve the
  current-password check, confirmation field, validation and feedback.
- List members with readable role and active/revoked status labels. Place Add
  team member beside the access list; expand its form on demand.
- Preserve owner-only account management, self-revocation protection and last-owner
  protection. Navigation visibility never replaces server authorization.

## Mobile and accessibility

- Collapse the desktop rail into a compact brand row and three visible navigation
  destinations; avoid a second tall header or horizontal page overflow.
- Stack account groups, keep essential labels visible and use at least 44px
  touch targets. Use 16px editable input text on phones.
- Keep a save action reachable above the phone's safe area without covering the
  last field or the keyboard-focused control.
- Provide keyboard navigation, visible focus states, associated field labels,
  semantic current-page/tab states and announced save/error feedback.
- Photo panels need an accessible name, Escape-to-close, focus containment and
  focus return to the originating tile. Warn before abandoning unsaved changes.
- Check narrow phones, tablets and desktop, including longer names and errors.

## Implementation order

1. Shared admin layout/navigation, typography, controls and spacing.
2. Website photo grid, focused photo panel and content navigation.
3. Account groups and signup table/empty state.
4. Responsive, keyboard and real save/login verification.

Keep the existing authentication, Atlas persistence, audit logging, upload
validation and authorization connected throughout. Validate the redesign locally
before pushing, since pushes to main automatically deploy to Hostinger.

## Acceptance checks

- All three current destinations work and accurately identify the active page.
- Login/logout, owner/staff restrictions and account protections still work.
- Edits save to Atlas, appear publicly and remain after redeployment.
- Save errors retain entered content; stale-revision conflicts remain visible.
- Image previews, descriptions and crop controls remain usable by keyboard.
- No clipping at 320px, 390px, tablet or desktop widths.
- No secrets, actual password changes or new account grants occur in the mockup.

The original proposal demonstrates local interactions only. The implemented
application connects to the existing account, publishing and signup actions.

## Implementation notes

- Desktop uses a 224px rail, a 64px top bar and a fluid working area. Phones use
  visible navigation; small phones omit decorative navigation icons to fit labels.
- Photo settings open in native modal dialogs with keyboard focus containment,
  Escape close and focus return. Save and upload errors are visible in the panel.
- A matching in-page dialog protects unsaved edits during navigation and signout.
  Reload/close retains the browser's standard unsaved-change protection.
- Homepage photos now use the existing Atlas database for persistent storage when
  no Blob token is configured. Owner and same-origin checks remain enforced; the
  configured public site origin handles reverse-proxy/internal-host differences.
- Subscriber totals, CSV export, pagination and account protections retain their
  real server actions. Out-of-range subscriber pages are clamped to the last page.

## Verification on 16 October 2026

Production build (including TypeScript), ESLint and whitespace checks passed.
An isolated local replica set was used for owner/staff accounts and 52 sample
signups. The live Atlas database was not used for test records or password changes.

Browser checks covered the photo grid and preview, caption/crop saves, focus
containment, Escape/focus return, keyboard tabs, FAQ add/remove/save, in-page
unsaved-change cancellation and confirmed navigation, account form expansion,
and 320px, 390px, 768px and desktop layouts. The narrow-phone navigation fits
without horizontal scrolling. Saved headline, caption and crop values were read
back from the isolated database.

HTTP checks verified CSV export, owner/staff restrictions, pagination and invalid
page clamping, valid image conversion/storage, invalid image rejection and
same-origin enforcement. The production build also verified that uploads remain
unavailable without persistent storage. The browser file chooser could not attach
a file because the browser extension lacked file access; upload endpoint checks
used a generated disposable image directly. Test accounts, data and uploads were
isolated from the live website.

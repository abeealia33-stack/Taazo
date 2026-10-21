# CHULIMAAR SEO and answer-engine content

Implementation updated: 22 October 2026. The existing visual system is retained.

## Public content

- `/`: exact requested homepage title/description, a product-specific H1, equal co-founder presentation and links to substantive guides.
- `/apricot-kernel-oil`: Apricot Kernel Oil from Skardu; product definition, location, intended culinary use, specification/storage status and ordering information.
- `/guides/apricot-oil-skin-hair`: ingredient-level cosmetic education with separate skin and hair answers and CIR reference.
- `/guides/apricot-kernel-oil-unsaturated-fats`: Pakistani composition research, AHA dietary context, direct low-fat clarification and evidence limitations.
- `/story`: Our Skardu Story; Asad Ali and Muhammad Raza presented equally as co-founders, without individual roles.
- `/our-process`, `/faq`, `/contact`, `/privacy`: supporting public pages. Contact uses only published CHULIMAAR channels, without the old Taazo/Lahore contact details.

The two former guide URLs issue one-hop 308 permanent redirects, preserving query parameters. Internal links, canonical URLs and sitemap use the new destinations.

## Facts and claims

Skardu pressing and the two co-founders' names are owner-supplied facts. Cooking is the primary positioning. No price, stock, exact ingredient declaration, smoke point, storage duration, certification, testimonial, rating, clinical result or cosmetic suitability is invented. Missing finished-product information is identified honestly.

Published research describes the oils or formulations studied. The fats guide places the Pakistani composition study and AHA sources beside the relevant answers. The skin/hair guide links CIR beside its cosmetic discussion. These references do not establish a CHULIMAAR treatment effect or endorse this product.

The owner still needs to provide approved label/specifications, finished-product usage and storage directions, actual public contact channels, additional firsthand story details and suitable photographs.

## CMS and imagery

Previous shipped homepage copy upgrades on read without writing the database. Exact matching preserves owner custom text, photographs and settings; the editor receives the upgraded content for a normal future save. New optional image slots are added safely to older saved content.

Admin > Website > Photos now includes kitchen, skin-care, hair-care and Skardu story slots. Upload genuine relevant photographs, describe what each actually shows, review captions and save. These optional slots are omitted from public pages until supplied. Do not use generated or stock production photographs as evidence of actual CHULIMAAR operations.

Existing responsive sizes and reserved image space remain. Approved Vercel Blob images can use Next.js optimization; offscreen hero slides have low fetch priority. The existing upload path resizes and converts photographs to WebP. Article images are included only when an appropriate guide image is provided, rather than defaulting to a generic social graphic.

## Metadata and structured data

Public HTML includes distinct titles, descriptions, canonical URLs, one H1 and direct answer paragraphs. Organization/WebSite identity, page breadcrumbs, guide Articles and descriptive Product data are emitted in server HTML with safe JSON serialization.

Organization identity names both co-founders equally. Article authorship remains CHULIMAAR; no expert reviewer is invented. Per-page editorial dates retain existing guide publication history from 18 October and record substantive changes on 22 October. Matching modification dates appear in the sitemap and Article/Open Graph data.

Product data has no invented Offer, rating or review. Descriptive Product markup alone does not meet Google's product-snippet eligibility requirements. No FAQ rich results or AI citations are promised.

Current documentation reviewed:
- [Google Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google Articles](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Organizations](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google Breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)

## Production and staging

`CHULIMAAR_SITE_URL` remains the canonical origin. The current website is the Hostinger address; the owner plans to buy a permanent domain later. Change the environment setting and rebuild/redeploy when migrating, with path-preserving permanent redirects from the previous public origin where supported.

`CHULIMAAR_SEARCH_INDEXING=false` is available for a separate staging deployment: pages emit noindex/nofollow, generated sitemap entries are omitted, robots disallows crawling, and the Next.js response header configuration adds X-Robots-Tag. Set this before building the staging deployment. Authentication remains necessary for truly private content.

Production defaults to public indexing. Utility-page noindex directives remain, and robots allows crawlers to retrieve those directives. Admin authentication is separate from robots.

**External blocker:** the public Hostinger robots response in the audit specifically disallowed Googlebot, despite the application allowing public crawling. Hostinger was opened during implementation and required sign-in. Local source/build checks cannot fix or verify that external override. After sign-in, inspect Hostinger/proxy/CDN/deployment configuration and retest the exact public response. No hosting change or production deployment has been made in this implementation session.

## Verification and release

The production build and targeted ESLint passed. The read-only HTTP suite passed against the local production server for nine public pages, metadata, answers, organization/co-founder identity, Article dates/citations, Product data, redirects, sitemap, utility-page noindex and crawl access. CMS upgrade checks verify preservation of custom copy/media, idempotence and safe addition of new photo slots. Staging sitemap/robots/header configuration passed a separate read-only check.

Browser checks at desktop and 390px mobile width inspected the existing visual treatment; checked mobile pages had no horizontal overflow. Local preview uses fallback content when the CMS database is unavailable, so live uploaded photographs must also be checked after deployment. These checks are not a claim of a measured Core Web Vitals score or Google rich-result validation.

Run after deployment:

```text
node --import tsx scripts/check-seo.ts <public-origin> [canonical-origin]
```

The canonical-origin argument is useful when checking a local preview whose URLs point to the production host. On production it normally equals public-origin.

Run Google Rich Results Test/Schema Markup Validator and URL Inspection on the deployed release; verify crawl access before requesting indexing. Set up/use the owner's Search Console and Bing Webmaster Tools, submit the sitemap and begin a fresh performance baseline. No performance report was available, so rankings and search volumes remain unverified.

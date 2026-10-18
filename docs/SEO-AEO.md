# Chulimaar SEO and answer-engine content

Content release: 18 October 2026.

## Public pages

- `/`: brand introduction, interactive product and launch signup, linked oil guides.
- `/apricot-kernel-oil`: product introduction, buying intent, current availability, price and delivery status.
- `/guides/apricot-oil-uses`: food/cosmetic distinctions and practical selection questions.
- `/guides/apricot-oil-benefits`: composition studies, nutrition context and evidence limitations, with primary sources.
- `/story`, `/our-process`, `/faq`: Chulimaar information; legacy Taazo pages at `/story` and `/faq` have been replaced. Other legacy commerce routes stay gated.

Each page has a canonical URL and unique metadata. Public layouts emit Organization and WebSite JSON-LD. Informational pages have WebPage and BreadcrumbList data; guides also have dated Article data with source citations. JSON-LD escapes `<` before insertion. No invented rating, stock, price, nutrition claim, medical author or Offer markup is emitted. FAQ content is visible HTML; no Google FAQ rich-result promise is made.

## Content maintenance

Update product availability, pricing, bottle size and delivery together when confirmed. Article publication/modification dates and sitemap modification dates are actual editorial dates, not the request time. Update the relevant dates when the content changes. Process/story/FAQ sections use approved homepage CMS copy where relevant; longer guides are maintained in source.

Do not turn chemical composition or laboratory antioxidant results into claims of disease treatment or cosmetic efficacy. Source studies do not test Chulimaar's forthcoming batch. Publish product-specific composition and cooking guidance only after it is confirmed.

## Domain and crawling

`CHULIMAAR_SITE_URL` is the public origin for canonicals, schema and sitemap. Set it to the permanent HTTPS domain before moving the site, rebuild/redeploy, and arrange redirects from previous public URLs. The production fallback is the current Hostinger address; localhost is used only when explicitly configured for local QA.

On 18 October the live temporary address returned a hosting-level robots response with `User-agent: Googlebot` / `Disallow: /`, differing from `src/app/robots.ts`. A source change alone cannot prove that this has been resolved. Check the actual response after deployment and in Google URL Inspection. The application allows public crawling, advertises the sitemap, and excludes admin/API/private preferences and prelaunch commerce routes. Robots exclusions are not access controls; admin authentication and private-page noindex are separate.

## Search measurement setup

1. Sign in to Google Search Console and Bing Webmaster Tools using the website owner's accounts.
2. Add the permanent domain property with DNS verification, or a URL-prefix property using the site's exact current HTTPS origin.
3. For HTML-tag verification, set the public token value in `GOOGLE_SITE_VERIFICATION` or `BING_SITE_VERIFICATION` in Hostinger, then redeploy. Do not paste an entire meta tag into the variable. Do not put account credentials in source.
4. Verify ownership, submit `/sitemap.xml`, and inspect the homepage and all six new information pages. Resolve blocked crawling before requesting indexing.
5. Record indexing, search queries, impressions, clicks and organic signups weekly; review Bing AI citation reporting where available. Search/AI visibility is not guaranteed, and Meta Pixel is not an organic-search reporting tool.

Changing Search Console ownership or DNS needs the owner's intended account/domain. Do not create an unrelated property or purchase a domain without their direction.

## Verification

`npx tsx scripts/check-seo.ts <base-url> [canonical-origin]` performs read-only public HTTP checks, including the live robots response. It fails if Hostinger still blocks Googlebot. Use the base URL itself as the canonical origin in the normal deployed environment. Also run the production build, targeted ESLint and browser checks at narrow and desktop widths before releasing.

# CHULIMAAR SEO and AEO audit and implementation plan

Prepared: 22 October 2026, Asia/Karachi. Status: planning only; application code and hosting have not been changed.

Implementation update, 22 October 2026: the application changes in this plan are now implemented locally. See [implementation and verification notes](SEO-AEO.md). Production build, targeted lint, nine-page local HTTP SEO checks, staging configuration checks and responsive browser checks passed. Production deployment and removal of the external Hostinger Googlebot block remain pending; Hostinger requires owner sign-in. Final product specifications, verified contact details and additional genuine photographs still require owner input. The audit below records the state before implementation.

The goal is to make CHULIMAAR discoverable for relevant apricot oil searches while keeping its existing visual design and cooking-first positioning. Search placement, indexing, rich results and AI citations cannot be guaranteed. Start with useful Pakistan and Skardu intent, then expand based on measured search performance.

## 1. Audit scope and evidence

Audited the local Next.js 16.3.4 source and the public origin configured as its fallback: [current Hostinger website](https://deepskyblue-dove-264491.hostingersite.com/). The owner confirmed that this is the website currently being managed and that a permanent domain will be purchased later. Use this origin consistently for now; no permanent domain has been selected. A future domain could have different crawling and ranking conditions.

Owner-confirmed presentation: **Asad Ali and Muhammad Raza — Co-founders of CHULIMAAR.** Present both equally, without individual role descriptions or a hierarchy.

Proposed story copy: “CHULIMAAR is founded by Asad Ali and Muhammad Raza, with roots in Skardu, Pakistan.” Develop their shared story from further firsthand details. Do not infer technical qualifications, article authorship, or the exact production process from their names.

Read live HTML, metadata, JSON-LD, robots directives and sitemap; reviewed existing content, image components, upload handling and a stored desktop design preview. This was not a fresh visual browser audit, a laboratory performance test, or an authenticated Search Console audit. Reviewed the installed Next.js JSON-LD, robots and sitemap documentation and current Google documentation linked below.

The existing read-only check was run against the public origin:

```text
npx tsx scripts/check-seo.ts https://deepskyblue-dove-264491.hostingersite.com
```

It passed its preceding page, metadata, HTML, schema-presence, sitemap and private/prelaunch-route assertions, then failed with:

```text
Hosting is still blocking Googlebot. Resolve this before requesting indexing.
```

These assertions do not substitute for Google's structured-data validators or URL Inspection.

## 2. What is already on the website

| Area | Verified current state | Planned improvement |
| --- | --- | --- |
| Homepage | Product introduction, bottle display, process, founder section, launch signup, FAQs and guide links | Keep the layout; align factual copy with the supplied brand context and use the requested metadata |
| Product | `/apricot-kernel-oil` exists and describes availability, buying questions and planned production | Turn it into the definitive product and culinary information page |
| Uses guide | `/guides/apricot-oil-uses` covers food/cosmetic distinctions and storage | Move product cooking/storage information to the product page; develop a focused skin and hair guide |
| Benefits guide | `/guides/apricot-oil-benefits` already discusses composition, nutrition context and evidence limits | Focus on unsaturated fats; add the Pakistani composition study and AHA references |
| Story | `/story` exists, but the founder is identified as “The founder of Chulimaar” | Present Asad Ali and Muhammad Raza equally as co-founders, with their shared story and actual photographs; omit individual role descriptions |
| Process | `/our-process` describes plans; method, temperature and sourcing are unconfirmed | Publish actual equipment, sourcing and processing facts when supplied |
| Metadata | Public pages have distinct titles/descriptions, canonicals and one H1 in checked live responses | Replace homepage metadata exactly; improve page specificity |
| Readable HTML | Important copy is present in server HTML, including streamed HTML | Preserve this; verify the rendered page in URL Inspection after deployment |
| Structured data | Organization, WebSite, WebPage, nested BreadcrumbList and guide Article data exist | Improve factual details, article images and date handling; add appropriate Product data |
| Sitemap | `/sitemap.xml` returns 200 and lists eight public URLs | Update routes, redirects and genuine modification dates together |
| Private pages | Checked admin login and launch preferences emit `noindex, nofollow`; commerce routes are gated during prelaunch | Retest in the actual production configuration and protect staging separately |
| Images | Bottle image assets, responsive image markup and image space reservations exist; uploaded photographs are resized and converted to WebP | Verify photographic provenance, improve descriptive alt text, add relevant guide/story photos and measure delivery costs |
| Contact | `/contact` currently redirects to the homepage footer; fetched footer contains no public email/WhatsApp links | Publish verified CHULIMAAR channels; replace legacy contact content before opening that route |

The old contact source still references the previous Taazo business and Lahore. It is currently hidden by the prelaunch redirect. Do not reuse that business's contact details for CHULIMAAR without confirmation.

Current homepage title:

> Apricot Kernel Oil from Skardu | Chulimaar

Current copy repeatedly says the first batch is planned. The new brief confirms founder pressing in Skardu. Align those statements with the brief, while separately verifying whether orders are open, which finished-product uses are supported and what directions are approved. Do not assume production means stock is available for sale.

## 3. First priority: production crawling

The [live robots response](https://deepskyblue-dove-264491.hostingersite.com/robots.txt) on 22 October returned:

```text
User-agent: Googlebot
Disallow: /

User-agent: *
Allow: /
```

That specifically blocks Googlebot from crawling the entire host. It also omits the sitemap declaration and application exclusions present in `src/app/robots.ts`. The precise override layer is unconfirmed; inspect Hostinger configuration, reverse proxy/CDN rules and deployed artifacts. Editing the application robots file alone has not resolved the public response.

The owner has confirmed this temporary host as the current website. Resolve its Googlebot block and serve the intended robots output if it is intended to be discoverable now; buying a domain is not a prerequisite for preparing or optimizing the content. Retest the external response and URL Inspection. Preserve authentication and private-page protections, and keep any separate staging host protected. [Google robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

When the permanent domain is ready, update `CHULIMAAR_SITE_URL`, canonical URLs, structured-data URLs and sitemap together; arrange path-preserving permanent redirects from the previous public origin where hosting permits. Verify the new domain in search tools and retest its own robots response. Do not publish an invented future domain in metadata.

Robots controls crawling; it is not a reliable way to keep private content out of results. Publicly accessible utility pages that need exclusion should use an effective `noindex`; Google must be allowed to fetch that directive. Private content requires access control. [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## 4. Ranking evidence and keyword priorities

No CHULIMAAR results were returned by the exact-brand public web-search query during this audit. That is a limited observation, not proof that Google indexes zero pages. The owner confirmed there is no performance report to share yet. Establish a fresh measurement baseline; current rankings, clicks, impressions, search volumes and keyword difficulty are **unverified**, not assumed to be zero.

Public search samples for Pakistan apricot oil returned product pages from [Olim](https://www.olim.pk/products/apricot-kernel-oil), [100Percent](https://100percent.pk/products/apricot-kernel), and [Hunza Alpine](https://hunzaalpine.com/product/apricot-kernel-oil/), plus a [skin and hair guide](https://seabuckthorn.com.pk/blog/hunza-apricot-oil-skin-hair/). Those pages demonstrate competing commercial and educational intent; their marketing claims are not evidence for CHULIMAAR. This is not a Pakistan-localized Google rank report or a search-volume study.

Strategic inference: founder-pressed Skardu origin and clear culinary information offer a useful distinction in a search sample that includes substantial cosmetic content. That does not establish low competition or high demand.

| Priority | Keyword cluster | Primary destination | Reason and conditions |
| --- | --- | --- | --- |
| 1 | CHULIMAAR; CHULIMAAR apricot oil | Homepage | Establish a recognizable brand and consistent identity |
| 1 | apricot kernel oil Pakistan; apricot oil Pakistan | Product | Direct product discovery and commercial relevance |
| 1 | apricot oil from Skardu; Skardu apricot oil | Product; story supplies origin evidence | Closely matches the supplied brand facts |
| 1 | apricot oil for cooking; is apricot kernel oil edible? | Product culinary sections | Supports primary positioning; specific directions require finished-product support |
| 2 | buy apricot kernel oil Pakistan; apricot oil price in Pakistan | Product buying sections | Address honestly; publish prices, availability and delivery only when confirmed |
| 2 | apricot oil for skin; apricot oil for hair | One skin and hair guide | Serve secondary educational intent without implying this bottle is a tested cosmetic |
| 2 | unsaturated fats in apricot oil; apricot kernel oil fatty acids | One fats guide | Answer composition and dietary-context questions with primary references |
| 3 | apricot oil benefits; what is apricot kernel oil?; how to store apricot oil | Relevant guide or product answer | Cover within useful pages rather than create separate keyword pages |
| Validate later | khubani ka tail; khubani oil; خوبانی کا تیل | A natural explanatory mention where useful | Check Pakistan query data and language needs before expanding; no duplicate transliteration pages |

Do not describe the product as “low-fat oil.” Answer “Is apricot kernel oil low-fat?” once in the fats guide to clarify the difference between fat quantity and fat type. Do not target disease treatment, hair regrowth, guaranteed skin results, or unverified “organic,” “cold-pressed,” “certified,” or “100% pure” claims.

Use each page to satisfy a distinct need. Related phrases belong in useful titles, introductory answers, relevant headings, captions and internal links where natural; there is no keyword-density target.

## 5. Page structure and proposed metadata

Keep `/apricot-kernel-oil` and `/story`. Refocus the two existing guides rather than leave competing copies online. Proposed descriptive guide URLs:

```text
/guides/apricot-oil-uses
  → /guides/apricot-oil-skin-hair

/guides/apricot-oil-benefits
  → /guides/apricot-kernel-oil-unsaturated-fats
```

Use one-hop permanent redirects if these moves are implemented; update every internal link, canonical and sitemap entry. Consolidate all useful old content into its appropriate destination. Do not also create alternative product or about pages for keyword variations.

| Page | Proposed exact title | Main heading |
| --- | --- | --- |
| `/` | CHULIMAAR \| Apricot Kernel Oil from Skardu, Pakistan | Apricot Kernel Oil from Skardu, Pakistan |
| `/apricot-kernel-oil` | Apricot Kernel Oil from Skardu \| CHULIMAAR | Apricot Kernel Oil from Skardu |
| `/guides/apricot-oil-skin-hair` | Apricot Oil for Skin and Hair \| CHULIMAAR | Apricot Oil for Skin and Hair |
| `/guides/apricot-kernel-oil-unsaturated-fats` | Apricot Kernel Oil and Unsaturated Fats \| CHULIMAAR | Apricot Kernel Oil and Unsaturated Fats |
| `/story` | Our Skardu Story \| CHULIMAAR | Our Skardu Story |

Homepage description, exactly as requested:

> Discover CHULIMAAR apricot kernel oil from Skardu, Pakistan. Explore our story, production process, product details, and everyday uses.

Proposed descriptions:

- Product: “Explore CHULIMAAR apricot kernel oil from Skardu, Pakistan. Find verified ingredients, product details, cooking guidance, storage and availability.”
- Skin/hair: “Learn how apricot oil is used in skin and hair care, what cosmetic conditioning means, and how to check whether a product suits your routine.”
- Fats: “Understand unsaturated fats in apricot oil, including oleic and linoleic acids, what research shows, and why apricot kernel oil is not a low-fat oil.”
- Story: “Discover CHULIMAAR’s Skardu roots, meet co-founders Asad Ali and Muhammad Raza, and explore how our apricot kernel oil is pressed and bottled in Pakistan.”

These are editorial drafts. Publish descriptions of product information and production only when the corresponding verified details are visible on the page. Avoid an automatic brand suffix duplicating the homepage title.

Retain `/our-process` only as a substantive account of the real process, with its own metadata and heading. Keep `/faq` focused on customer logistics with links to detailed answers. Replace `/contact` with verified CHULIMAAR content when the public contact page is opened. Keep privacy information current. Do not expand these into repetitive search landing pages.

## 6. Answer-first content brief

Each question should be an H2 followed immediately by a short answer in HTML. Add explanation or a practical table only when useful. Place the relevant reference beside the answer. A fixed word count is not a search requirement.

| Question | Page | Content decision |
| --- | --- | --- |
| What is apricot kernel oil? | Product | Explain extraction from the kernel inside the apricot stone; distinguish the oil from whole kernels |
| Where is CHULIMAAR oil pressed? | Product and story | State Skardu, Pakistan, as supplied in the brief; describe the verified production process without assigning individual roles to either co-founder |
| What fats does apricot kernel oil contain? | Fats guide | Explain oleic/monounsaturated and linoleic/polyunsaturated fats plus some saturated fats; cite the Pakistani study and distinguish research samples from this product |
| What is good about unsaturated fats? | Fats guide | Use the draft below with AHA and composition references |
| Is apricot kernel oil low-fat? | Fats guide | Direct answer: no; predominantly unsaturated describes the type of fat, not a reduced total fat content. Do not invent CHULIMAAR nutrition values |
| How is apricot kernel oil used in skin care? | Skin/hair guide | Explain cosmetic conditioning/emollient uses at ingredient level, supported by CIR; separate these from finished-product suitability |
| How can apricot oil fit into a hair-care routine? | Skin/hair guide | Discuss conditioning of lengths/ends only to the extent supported; use directions for an appropriately labelled product. Do not invent dosage, timing or a hair-growth effect |
| Is this particular product suitable for cooking? | Product | Cooking is the primary intended use. Publish a definitive suitability answer and permitted culinary methods from verified finished-product information; no assumed smoke point or frying suitability |
| How should the product be stored? | Product | Publish approved storage, shelf life and after-opening instructions. Do not assume refrigeration or a generic number of months |

Proposed educational answer:

> Replacing saturated fats with unsaturated fats can help lower LDL (“bad”) cholesterol as part of a balanced diet. Apricot kernel oils studied in published research contain predominantly unsaturated fats, including oleic and linoleic acids. This general evidence does not demonstrate a cholesterol-lowering effect for CHULIMAAR itself.

References beside that answer: [American Heart Association — Saturated Fats](https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats), [AHA — Fats in Foods](https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/fats-in-foods), and [Manzoor et al., Pakistani apricot varieties, 2012](https://grasasyaceites.revistas.csic.es/index.php/grasasyaceites/article/view/1366/0).

The Pakistani study analyzed four varieties; oleic and linoleic acids were major fatty acids. It is composition evidence, not a test of CHULIMAAR or a clinical trial of cholesterol reduction. If percentages are discussed, label them as study-specific, not a product nutrition panel.

For cosmetic education, [CIR's Safety Assessment of Plant-Derived Fatty Acid Oils](https://journals.sagepub.com/doi/10.1177/1091581817740569) includes apricot kernel oil and discusses cosmetic use and safety. It supports ingredient-level context, not approval of CHULIMAAR, a treatment claim, or a prescribed hair-care routine. Verify any specific hair-conditioning assertion against an appropriate source before publication.

## 7. Credibility and facts needed

The public pages need these factual inputs; do not fill gaps with plausible guesses:

- Co-founders Asad Ali and Muhammad Raza are named equally above. Still needed: their fuller shared story and genuine photographs suitable for publication. Omit individual role descriptions.
- Current production/launch/sales status; actual pressing location, equipment and method; filtration/refining and bottling facts where relevant. Distinguish kernel sourcing origin from pressing location.
- Final ingredient declaration, any additives, bottle sizes and label photographs. Do not infer a single-ingredient or purity claim from the product name.
- Finished-product basis for cooking suitability and each recommended culinary use; approved heat guidance if available.
- Finished-product support for any proposed skin or hair usage claim. Otherwise keep these guides educational.
- Storage directions, shelf life, after-opening advice and relevant label precautions.
- Actual price/currency, stock status, delivery coverage and ordering method when available.
- Verified public email, WhatsApp/phone and social profiles; do not import the legacy Taazo contacts.

Keep the real organization as article author if it actually compiled the guides. Use a named author only when genuine. Add reviewer identity, credentials and review date only for an actual completed review. Preserve genuine publication dates and change modification dates only with substantive updates. The current shared `CONTENT_DATE` should become per-page publication/modification data, with matching visible dates and sitemap values.

## 8. Images and design preservation

Preserve the logo, cream/brown palette, typography, spacing, section patterns, bottle interaction and responsive style. Reuse `InfoPage`, `ProductShowcase`, the existing guide cards and footer components. Keep longer education on the guide pages and link to it from short homepage sections. The homepage H1 can use the existing two-line visual treatment; the Skardu slogan can remain elsewhere as brand copy.

| Placement | Image requirement | Example alt text, only if the image actually shows it |
| --- | --- | --- |
| Product | Actual current bottle and readable label photographs | “CHULIMAAR apricot kernel oil bottle, front label” |
| Culinary section | Real oil use in a kitchen, matching verified cooking guidance | “Apricot oil poured over a prepared dish” |
| Skin guide | Oil applied to hands | “A drop of oil being spread over the back of a hand” |
| Hair guide | Oil applied to hair ends | “Oil being smoothed through the ends of hair” |
| Story/process | Actual founder, Skardu location and production work | “[Founder name] operating the oil press in Skardu” |

The site has supplied bottle assets, but this audit has not established that every view is actual finished-product photography. Confirm provenance before using any asset as product evidence. Keep illustrations clearly recognizable as illustrations. Do not use generated production or founder images as documentary evidence.

Some live alt text currently describes marketing messages, such as preparing the first batch, instead of the visible subject. Inspect each photo before rewriting its alt text. Decorative images should have empty alt text where appropriate.

Responsive `sizes`/`srcset`, WebP uploads and reserved aspect ratios already exist. Keep those protections; use intrinsic dimensions where applicable and stable containers for `fill` images. Audit external images that bypass optimization, original PNG sizes, slideshow eager loading and offscreen bottle views. Prioritize the initially visible hero and defer other assets when practical without breaking the rotation. Measure mobile loading and layout movement before making performance claims. Use topic-relevant guide images in Article data rather than the current generic social graphic when available.

## 9. Structured data and AEO

Current search-engine documentation was checked during this audit. Implement only data supported by the visible page:

- **Organization:** use a stable identity, brand name, real logo, public URL and only verified contact/social details. [Google Organization documentation](https://developers.google.com/search/docs/appearance/structured-data/organization).
- **Product:** place on the single product page with its real name, description, brand and actual imagery. Add Offer price/currency/availability only when current and visible. Descriptive Product data can exist without a purchasable offer, but that alone does not satisfy Google's product-snippet requirements; do not fabricate reviews or offers to qualify. [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).
- **Article:** use on the two educational guides with genuine authorship, meaningful dates, citations and representative images. [Google Article documentation](https://developers.google.com/search/docs/appearance/structured-data/article).
- **BreadcrumbList:** reflect the visible trail and final canonical URLs. There is no need to invent a thin guide-index page solely to support breadcrumbs. [Google Breadcrumb documentation](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

Validate JSON-LD syntax with Schema Markup Validator and Google-supported features with Rich Results Test. Keep JSON-LD in server HTML and preserve the existing `<` escaping. Valid schema and eligibility do not guarantee a search appearance.

For AEO, use concise question answers, visible supporting references, clear entities, descriptive internal links and accessible textual content. Google says ordinary SEO fundamentals apply to its AI features and there is no special AI schema or extra machine-readable file requirement. A page must be indexed and eligible for a search snippet to qualify as a supporting link. No promise of FAQ rich results or AI citations should appear in site copy. [Google AI features documentation](https://developers.google.com/search/docs/appearance/ai-features).

## 10. Implementation order and completion checks

1. **Resolve crawl access on the current Hostinger origin.** Inspect the robots override; retest public pages and resources externally. Keep staging protected. Use the current origin consistently until the permanent domain is purchased, then perform the domain migration described above.
2. **Establish a fresh measurement baseline.** Set up or use the owner's Google Search Console and Bing Webmaster Tools properties, submit the current public sitemap, and inspect core URLs after the crawl issue is resolved. No historical performance report is available from the owner yet.
3. **Update the four core destinations.** Implement the exact homepage metadata, product facts and answer sections, focused guides and founder story. Add only verified information as it becomes available; do not block general educational improvements on unrelated price information.
4. **Consolidate URLs and links.** Add one-hop permanent guide redirects; update canonical URLs, sitemap, guide cards, footer and contextual links. Link educational pages to the product where relevant, and product to the process/story as factual evidence.
5. **Complete media, accessibility and schema.** Add genuine photos, check mobile layout, heading order, contrast, focus, keyboard controls and reduced motion. Keep all substantive information accessible without requiring interaction with bottle views.
6. **Validate locally and on deployment.** Update the existing SEO check for new URLs, redirects and per-page dates; run appropriate production build/static checks. Confirm one H1, distinct metadata, matching canonicals, HTML answers, adjacent references, schema/visible-content agreement, valid sitemap and public/private indexing behavior. Capture comparable mobile and desktop screenshots to confirm the design remains consistent. Check public deployment output, not only local source.
7. **Improve using measured demand.** Review the first available data, then monthly comparisons. Add content only when it answers a distinct unresolved customer need. Seek genuine relevant mentions from suppliers, Skardu/Baltistan publications, food writers and the founder's existing channels; no fabricated endorsements or purchased ranking links. Outreach is a future owner activity, not authorized messaging in this audit.

For verified rankings, inspect Search Console's Search results report for the last three months and, when available, a recent 28-day comparison. Start with Pakistan and segment mobile/desktop; separate branded and non-branded queries. Record query, landing page, clicks, impressions, CTR and average position. Also inspect indexed URLs and Google-selected canonicals. [Google Performance report documentation](https://support.google.com/webmasters/answer/7576553).

Use that data to distinguish existing performers from opportunities: useful pages with impressions but weak clicks need a title/intent review; relevant queries with emerging visibility need better answers and evidence; absent queries require an indexing/intent check before further content expansion. Average position is a reporting average, not a guaranteed rank for every searcher.

Success means the intended production pages can be crawled, their facts are trustworthy, their topics are distinct, and relevant search impressions, qualified visits and genuine enquiries/signups or orders improve over time. There is no defensible promise that the site will appear for every apricot oil search or reach a specific position by a fixed date.

## 11. Implementation locations

- `src/lib/seo.ts`: exact homepage metadata, guide links and per-page date support.
- `src/app/layout.tsx` and `src/app/(site)/layout.tsx`: metadata inheritance and factual organization identity.
- `src/app/(site)/page.tsx`, `src/lib/homepage-schema.ts` and approved CMS content: homepage heading, concise copy and fact consistency.
- Product, guide, story, process, FAQ and contact routes: content and distinct metadata.
- `src/components/prelaunch/InfoPage.tsx`: bylines, visible dates, citations, representative article images and matching schema.
- Header/footer/guide components: descriptive links within the existing design.
- `next.config.mjs` or the appropriate supported routing layer: permanent guide redirects; approved remote-image handling if needed.
- `src/app/sitemap.ts`, `src/app/robots.ts`, private layouts and hosting configuration: final public URL set and crawl/index controls.
- `scripts/check-seo.ts`: updated expected routes, dates, redirects, fact/schema checks and live robots verification.

Read the relevant installed Next.js 16.3.4 guides before each code change, as required by `AGENTS.md`. Existing unrelated work in the repository must be preserved.

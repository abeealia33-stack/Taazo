# Chulimaar Meta Pixel

Configured for the live website on 18 October 2026.

- Business portfolio: Chulimaar, `1358009641750205`.
- Ad account: Chulimaar, `951265084308951`.
- Dataset/pixel: Chulimaar, `2547720862399018` (public identifier).
- Website: `https://deepskyblue-dove-264491.hostingersite.com`.
- Meta's website allow list permits that hostname and its subdomains. The application is stricter and only enables tracking on the exact production hostname and the homepage.

## Events

| Meta event | Trigger |
| --- | --- |
| PageView | Homepage visit after advertising-cookie consent; deduplicated during hydration and hash navigation. |
| ViewContent | The oil section enters view after consent; once per document. |
| Lead | The server successfully creates a new launch signup. Duplicate submissions, invalid forms, failed saves and concurrent duplicate requests do not generate extra leads. |

The server supplies a random advertising event ID only for a new signup. It is unrelated to the email or private removal token. The client deduplicates the conversion ID. The signup's email, first name, city and private removal credentials are not passed to the pixel. No Purchase, AddToCart or checkout events are invented for the pre-launch site.

## Visitor choices and isolation

The Meta SDK loads only after advertising-cookie acceptance. Rejection is the default until a choice is made. Cookie settings remains available at the bottom of public pages for withdrawal. The choice is stored in the visitor's browser. Revocation stops future event commands and expires the integration's first-party Meta cookies where the browser allows it.

No SDK is loaded on local previews, admin routes or private launch-removal pages. Sensitive query-string keys also block tracking. The private removal link performs a full navigation so a previously loaded third-party SDK cannot follow an in-page transition to the token URL. Automatic advanced matching, automatic event detection and Meta's optional detailed page/product collection are disabled. Explicit event tracking remains enabled.

The integration is browser-side Meta Pixel. Conversions API and external gateways have not been configured. No access token or app secret is committed. `NEXT_PUBLIC_META_PIXEL_ID` can override the public ID; it is not a place for an access token.

## Campaign use

For the current signup website, use a Website conversion location, select this dataset, and select the Lead conversion event. Event availability and optimization depend on Meta receiving eligible events and the campaign's settings. The installation does not create, publish, change budgets or start spending on campaigns. Purchase optimization requires a later commerce implementation with real completed orders and their confirmed values.

When moving to a custom domain, update both `META_PIXEL_HOST` in the application and the Meta dataset's website allow list before switching ads to it.

## Verification

`scripts/check-meta-pixel.ts` uses browser API fakes without sending data to Meta. It verifies consent/withdrawal, private URL and hostname isolation, deduplication, rejection of failed/existing signups, no form-value transmission, and graceful handling of a blocked SDK. `scripts/check-prelaunch.ts` uses an isolated local database to verify creation, duplicate/concurrent signups, private removal and conversion-ID eligibility. The cookie UI was also checked in a 320 × 568 browser viewport, including acceptance/rejection persistence and 44px controls.

The pixel base-code identifier and connection settings were read directly from Meta Events Manager's installation UI, under the Chulimaar account. Meta's public developer documentation returned rate-limit errors during setup.

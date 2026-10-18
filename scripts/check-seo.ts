/** Read-only HTTP checks. Supply the deployed URL to verify a release. */
import assert from "node:assert/strict";

const base = new URL(process.argv[2] || "http://127.0.0.1:3026");
const expectedOrigin = process.argv[3] || base.origin;
assert(["https:", "http:"].includes(base.protocol));
const pages = ["/", "/apricot-kernel-oil", "/guides/apricot-oil-uses", "/guides/apricot-oil-benefits", "/story", "/our-process", "/faq", "/privacy"];
const titles = new Set<string>();
const schemas: unknown[] = [];
async function main() {
  for (const path of pages) {
    const response = await fetch(new URL(path, base), { redirect: "manual" });
    assert.equal(response.status, 200, `${path} must be a real page, not a redirect.`);
    const html = await response.text();
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    assert(title && !titles.has(title), `${path} needs a unique title.`); titles.add(title);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.match(html, /<meta name="robots" content="index, follow"/);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(new URL(canonical!).href, new URL(path, expectedOrigin).href, `${path} canonical`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path} should have one main heading.`);
    assert(!/taazo(?:'s| juice| started|\.)/i.test(html), `${path} must not expose legacy brand copy.`);
    const json = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    schemas.push(...json);
    assert(json.some(data => data["@graph"]?.some((node: Record<string, unknown>) => node["@type"] === "Organization")), `${path} brand identity`);
    if (path !== "/privacy") {
      assert(json.some(data => data["@type"] === "WebPage" || data["@graph"]?.some((node: Record<string, unknown>) => node["@type"] === "WebPage")), `${path} page schema`);
    }
    if (path.startsWith("/guides/")) {
      const article = json.flatMap(data => data["@graph"] || []).find(node => node["@type"] === "Article");
      assert(article?.citation?.length && article.datePublished === "2026-10-18", "Guides need dated articles and sources.");
      assert(html.includes('id="sources"') && html.includes('aria-label="On this page"'));
    }
    assert(!html.includes('id="chulimaar-meta-pixel"'), "Initial HTML must not load advertising before consent.");
  }
  assert(!JSON.stringify(schemas).includes('"@type":"Offer"'), "Prelaunch pages must not advertise a purchasable offer.");
  const sitemap = await (await fetch(new URL("/sitemap.xml", base))).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]));
  assert.deepEqual(urls.map(url => url.pathname).sort(), [...pages].sort());
  assert(urls.every(url => url.origin === expectedOrigin));
  for (const path of ["/shop", "/cart", "/checkout", "/track"]) {
    const response = await fetch(new URL(path, base), { redirect: "manual" });
    assert(response.status >= 300 && response.status < 400 || response.status === 404, `${path} must remain unavailable during prelaunch.`);
  }
  const admin = await (await fetch(new URL("/admin/login", base))).text();
  const removal = await (await fetch(new URL("/launch-preferences", base))).text();
  for (const html of [admin, removal]) assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  const robots = await (await fetch(new URL("/robots.txt", base))).text();
  assert(!/User-agent:\s*Googlebot\s+Disallow:\s*\//i.test(robots), "Hosting is still blocking Googlebot. Resolve this before requesting indexing.");
  assert(robots.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`), "Robots must advertise the public sitemap.");
  console.log("Passed: public routes, unique metadata, canonicals, readable HTML, structured data, sitemap, crawl access and prelaunch/private-route protection.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

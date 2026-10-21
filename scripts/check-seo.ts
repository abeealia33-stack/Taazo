/** Read-only SEO/content checks against a local preview or the deployed website. */
import assert from "node:assert/strict";
import { PAGE_DATES, HOME_TITLE, HOME_DESCRIPTION } from "../src/lib/seo";
import { defaultHomepageContent, homepageSchema } from "../src/lib/homepage-schema";
import { upgradeHomepageCopy } from "../src/lib/homepage-copy";

const base = new URL(process.argv[2] || "http://127.0.0.1:3026");
const expectedOrigin = process.argv[3] || base.origin;
const pages = [...Object.keys(PAGE_DATES), "/privacy"];
const redirects = {
  "/guides/apricot-oil-uses": "/guides/apricot-oil-skin-hair",
  "/guides/apricot-oil-benefits": "/guides/apricot-kernel-oil-unsaturated-fats",
};
const titles = new Set<string>();
const descriptions = new Set<string>();
const allSchemas: Record<string, unknown>[] = [];
const bodies = new Map<string, string>();
const requiredQuestions: Record<string, string[]> = {
  "/apricot-kernel-oil": ["What is apricot kernel oil?", "Where is CHULIMAAR oil pressed?", "Is this particular product suitable for cooking?", "How should the product be stored?"],
  "/guides/apricot-oil-skin-hair": ["How is apricot kernel oil used in skin care?", "How can apricot oil fit into a hair-care routine?"],
  "/guides/apricot-kernel-oil-unsaturated-fats": ["What fats does apricot kernel oil contain?", "What is good about unsaturated fats?", "Is apricot kernel oil low-fat?"],
};
type JsonNode = Record<string, unknown>;
function nodes(value: unknown): JsonNode[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object") return [];
  const node = value as JsonNode;
  return [node, ...Object.values(node).flatMap(nodes)];
}
async function get(path: string) {
  return fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
}
function visible(html: string) {
  return html.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<style\b[\s\S]*?<\/style>/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}
async function main() {
  assert(["https:", "http:"].includes(base.protocol));
  const original = defaultHomepageContent();
  original.text.founderName = "The founder of Chulimaar";
  original.text.heroTitle = "An owner-written headline";
  const photo = original.images.oil.url;
  const upgraded = upgradeHomepageCopy(original);
  assert.equal(upgraded.text.founderName, "Asad Ali & Muhammad Raza");
  assert.equal(upgraded.text.heroTitle, "An owner-written headline", "Keep custom CMS copy.");
  assert.equal(upgraded.images.oil.url, photo, "Keep uploaded and supplied image choices.");
  assert.deepEqual(upgradeHomepageCopy(structuredClone(upgraded)), upgraded, "Copy migration must be idempotent.");
  const legacy = structuredClone(upgraded) as unknown as { images: Record<string, unknown> };
  for (const key of ["kitchen", "skin", "hair", "skardu"]) delete legacy.images[key];
  const migrated = homepageSchema.parse(legacy);
  assert.equal(migrated.images.oil.url, photo);
  assert.equal(migrated.images.skin.url, "", "New image slots must not break older saved pages.");

  for (const path of pages) {
    const response = await get(path);
    assert.equal(response.status, 200, path + " must be a real public page.");
    assert(!response.headers.get("x-robots-tag")?.includes("noindex"), path + " must be indexable.");
    const html = await response.text();
    bodies.set(path, html);
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert(title && !titles.has(title), path + " needs a unique title."); titles.add(title);
    assert(description && !descriptions.has(description), path + " needs a unique description."); descriptions.add(description);
    assert.match(html, /<meta name="robots" content="index, follow"/);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(new URL(canonical!).href, new URL(path, expectedOrigin).href, path + " canonical");
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path + " needs one H1.");
    const text = visible(html);
    assert(!/taazo|Lahore|0312 4433199/i.test(text), path + " must not expose the legacy business.");
    assert(!/[A-Za-z]\?s\b|\(\?bad\?\)/.test(text), path + " must not contain damaged punctuation.");
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const data = scripts.flatMap(nodes);
    allSchemas.push(...data);
    const organization = data.find(node => node["@type"] === "Organization" && node.founder);
    assert(organization, path + " needs the verified organization.");
    assert.deepEqual((organization.founder as JsonNode[]).map(person => person.name), ["Asad Ali", "Muhammad Raza"]);
    if (path !== "/privacy") assert(data.some(node => node["@type"] === "WebPage"));
    if (path !== "/" && path !== "/privacy") assert(data.some(node => node["@type"] === "BreadcrumbList"));
    for (const question of requiredQuestions[path] || []) {
      assert(text.includes(question), path + " missing answer: " + question);
      assert(html.includes("<h2>" + question + "</h2><p>"), question + " needs an immediate paragraph answer.");
    }
    if (path.startsWith("/guides/")) {
      const article = data.find(node => node["@type"] === "Article");
      assert(article);
      assert.equal(article.datePublished, PAGE_DATES[path].published);
      assert.equal(article.dateModified, PAGE_DATES[path].modified);
      assert(html.includes('dateTime="' + PAGE_DATES[path].modified + '"'));
      assert(text.includes("Updated") && text.includes("By"));
      assert((article.citation as string[]).length > 0);
      for (const citation of article.citation as string[]) assert(html.includes('href="' + citation + '"'), "Citations must be visibly linked.");
      assert(html.includes('id="sources"'));
    }
    assert(!html.includes('id="chulimaar-meta-pixel"'), "No advertising pixel before consent.");
    console.log("Passed page: " + path);
  }
  assert.equal(bodies.get("/")!.match(/<title>(.*?)<\/title>/)?.[1], HOME_TITLE);
  assert(bodies.get("/")!.includes('name="description" content="' + HOME_DESCRIPTION + '"'));
  for (const path of ["/", "/story"]) {
    const text = visible(bodies.get(path)!);
    assert(text.includes("Asad Ali") && text.includes("Muhammad Raza"));
    assert(text.includes("co-founders") || text.includes("Co-founders"));
  }
  assert(allSchemas.some(node => node["@type"] === "Product"), "Product page needs descriptive Product data.");
  assert(!allSchemas.some(node => ["Offer", "AggregateOffer", "Review", "AggregateRating", "FAQPage"].includes(String(node["@type"]))), "Do not invent offers, reviews, ratings or FAQ rich-result eligibility.");
  for (const [from, to] of Object.entries(redirects)) {
    const response = await get(from + "?source=seo-check");
    assert.equal(response.status, 308, from + " needs a permanent redirect.");
    const location = new URL(response.headers.get("location")!, base);
    assert.equal(location.pathname, to);
    assert.equal(location.searchParams.get("source"), "seo-check");
  }
  const sitemapResponse = await get("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]));
  assert.deepEqual(urls.map(url => url.pathname).sort(), [...pages].sort());
  assert(urls.every(url => url.origin === expectedOrigin));
  for (const path of ["/shop", "/cart", "/checkout", "/track"]) {
    const response = await get(path);
    assert(response.status >= 300 && response.status < 400 || response.status === 404, path + " must stay gated during prelaunch.");
  }
  for (const path of ["/admin/login", "/launch-preferences"]) {
    const html = await (await get(path)).text();
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  }
  const robotsResponse = await get("/robots.txt");
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert(!/User-agent:\s*Googlebot\s+Disallow:\s*\//i.test(robots), "Hosting is still blocking Googlebot. Resolve the public hosting override before requesting indexing.");
  assert(robots.includes("Sitemap: " + expectedOrigin + "/sitemap.xml"), "Public robots must advertise the sitemap.");
  assert(!/Disallow:\s*\/launch-preferences/.test(robots), "Google must be able to see utility-page noindex.");
  console.log("Passed: public HTML, metadata, answers, co-founders, schema consistency, editorial dates, redirects, sitemap, privacy and crawl access.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

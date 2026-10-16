/** HTTP checks against the isolated CMS QA server, never the normal database. */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma";

const db = new PrismaClient();
const base = "http://localhost:3006";
const uploads: string[] = [];
function cookie(id: string) {
  const payload = `${id}.${Date.now() + 600_000}`;
  return `taazo_admin=${payload}.${createHmac("sha256", process.env.AUTH_SECRET!).update(payload).digest("base64url")}`;
}
async function post(file: File, auth?: string, origin = base) {
  const body = new FormData(); body.set("photo", file);
  return fetch(`${base}/api/admin/homepage-upload`, { method: "POST", headers: { origin, ...(auth ? { cookie: auth } : {}) }, body });
}
async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  assert(["localhost", "127.0.0.1"].includes(url.hostname) && url.port === "27019" && url.pathname.startsWith("/chulimaar_cms_qa"));
  try {
    const owner = await db.adminUser.findUniqueOrThrow({ where: { email: "admin@chulimaar.com" } });
    const staff = await db.adminUser.findUniqueOrThrow({ where: { email: "cms-staff@example.invalid" } });
    const png = await sharp({ create: { width: 32, height: 32, channels: 3, background: "#DC803F" } }).png().toBuffer();
    const image = () => new File([new Uint8Array(png)], "qa.png", { type: "image/png" });
    assert.equal((await post(image())).status, 403);
    assert.equal((await post(image(), cookie(staff.id))).status, 403);
    assert.equal((await post(image(), cookie(owner.id), "https://wrong.example")).status, 403);
    assert.equal((await post(new File(["broken"], "broken.png", { type: "image/png" }), cookie(owner.id))).status, 400);
    const uploaded = await post(image(), cookie(owner.id)); assert.equal(uploaded.status, 200);
    const { url: photoUrl } = await uploaded.json(); assert.match(photoUrl, /^\/media\/chulimaar\/[a-f0-9]{64}\.webp$/);
    const imageId = photoUrl.split("/").at(-1)!.replace(/\.webp$/, ""); uploads.push(imageId);
    const stored = await db.homepageImage.findUniqueOrThrow({ where: { id: imageId } });
    assert.equal((await sharp(Buffer.from(stored.data)).metadata()).format, "webp");
    const publicImage = await fetch(base + photoUrl); assert.equal(publicImage.status, 200);
    assert.equal(publicImage.headers.get("content-type"), "image/webp");
    assert(publicImage.headers.get("cache-control")?.includes("immutable"));
    assert(Buffer.from(await publicImage.arrayBuffer()).equals(Buffer.from(stored.data)));
    assert.equal((await fetch(base + photoUrl, { headers: { "if-none-match": publicImage.headers.get("etag")! } })).status, 304);
    const repeated = await post(image(), cookie(owner.id)); assert.equal((await repeated.json()).url, photoUrl);
    assert.equal((await fetch(base + "/media/chulimaar/not-an-image.webp")).status, 404);
    const editor = await fetch(`${base}/admin/website`, { headers: { cookie: cookie(owner.id) } });
    const html = await editor.text(); assert.equal(editor.status, 200); assert(html.includes("Website sections")); assert(html.includes("Save changes"));
    const denied = await fetch(`${base}/admin/website`, { headers: { cookie: cookie(staff.id) }, redirect: "manual" });
    const deniedHtml = await denied.text(); assert([307, 303].includes(denied.status) || deniedHtml.includes("NEXT_REDIRECT")); assert(!deniedHtml.includes('aria-label="Website sections"'));
    const publicPage = await fetch(`${base}/`); assert.equal(publicPage.status, 200); assert((await publicPage.text()).includes("Rooted in Skardu."));
    console.log("Passed: owner editor access, staff/anonymous denial, same-origin uploads, invalid image rejection, durable WebP upload/read, immutable caching, deduplication, and public rendering.");
  } finally {
    for (const id of uploads) await db.homepageImage.delete({ where: { id } });
    await db.$disconnect();
  }
}
main().catch(() => { console.error("HTTP CMS verification failed."); process.exitCode = 1; });

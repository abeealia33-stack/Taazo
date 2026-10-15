/** HTTP checks against the isolated CMS QA server, never the normal database. */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
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
    const { url: photoUrl } = await uploaded.json(); assert.match(photoUrl, /^\/uploads\/chulimaar\/[a-f0-9-]+\.webp$/); uploads.push(photoUrl);
    const bytes = await readFile(path.join(process.cwd(), "public", photoUrl)); assert.equal((await sharp(bytes).metadata()).format, "webp");
    const editor = await fetch(`${base}/admin/website`, { headers: { cookie: cookie(owner.id) } });
    const html = await editor.text(); assert.equal(editor.status, 200); assert(html.includes("Website sections")); assert(html.includes("Save changes"));
    const denied = await fetch(`${base}/admin/website`, { headers: { cookie: cookie(staff.id) }, redirect: "manual" });
    const deniedHtml = await denied.text(); assert([307, 303].includes(denied.status) || deniedHtml.includes("NEXT_REDIRECT")); assert(!deniedHtml.includes('aria-label="Website sections"'));
    const publicPage = await fetch(`${base}/`); assert.equal(publicPage.status, 200); assert((await publicPage.text()).includes("Rooted in Skardu."));
    console.log("Passed: owner editor access, staff/anonymous denial, same-origin uploads, invalid image rejection, actual WebP upload/storage, and public rendering.");
  } finally {
    for (const photoUrl of uploads) {
      const target = path.resolve("public", photoUrl.slice(1));
      assert(target.startsWith(path.resolve("public/uploads/chulimaar") + path.sep));
      await unlink(target);
    }
    await db.$disconnect();
  }
}
main().catch(() => { console.error("HTTP CMS verification failed."); process.exitCode = 1; });

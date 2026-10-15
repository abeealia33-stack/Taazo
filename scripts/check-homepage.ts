/** Integration QA only: requires a disposable localhost database on port 27019. */
import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import { defaultHomepageContent, homepageSchema, HOMEPAGE_KEY } from "../src/lib/homepage-schema";
import { contentRevision, getHomepageContent, persistHomepage } from "../src/lib/homepage-content";

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  assert(["127.0.0.1", "localhost"].includes(url.hostname) && url.port === "27019" && /^\/chulimaar_cms_qa/.test(url.pathname), "Use only a disposable local CMS QA database on port 27019.");
  const mongo = new MongoClient(url.toString(), { directConnection: true, serverSelectionTimeoutMS: 5000 });
  await mongo.connect();
  try {
    try { await mongo.db("admin").command({ replSetGetStatus: 1 }); }
    catch (error) { if (!(error && typeof error === "object" && "code" in error && error.code === 94)) throw error; await mongo.db("admin").command({ replSetInitiate: { _id: "cmsqa", members: [{ _id: 0, host: "127.0.0.1:27019" }] } }); }
    let primary = false;
    for (let attempt = 0; attempt < 40; attempt++) { primary = Boolean((await mongo.db("admin").command({ hello: 1 })).isWritablePrimary); if (primary) break; await setTimeout(500); }
    assert(primary, "The isolated replica set must become writable.");
    await mongo.db().collection("Setting").createIndex({ key: 1 }, { unique: true });
    await mongo.db().collection("AdminUser").createIndex({ email: 1 }, { unique: true });
    await mongo.db().collection("Setting").deleteMany({ key: HOMEPAGE_KEY });
    const defaults = defaultHomepageContent();
    assert(homepageSchema.safeParse(defaults).success);
    const invalid = structuredClone(defaults); invalid.images.hero.url = "javascript:alert(1)";
    assert(!homepageSchema.safeParse(invalid).success);
    invalid.images.hero.url = "https://untrusted.example/image.png";
    assert(!homepageSchema.safeParse(invalid).success);
    invalid.images.hero.url = "/chulimaar/../private.png";
    assert(!homepageSchema.safeParse(invalid).success);
    invalid.images.hero.url = "/uploads/chulimaar/test.webp"; invalid.images.hero.alt = "";
    assert(!homepageSchema.safeParse(invalid).success);
    const malformed = structuredClone(defaults); malformed.contact.instagram = "javascript:alert(1)";
    assert(!homepageSchema.safeParse(malformed).success);
    malformed.contact.instagram = "not-a-url";
    assert(!homepageSchema.safeParse(malformed).success);
    const owner = await db.adminUser.upsert({ where: { email: "admin@chulimaar.com" }, create: { name: "Chulimaar QA owner", email: "admin@chulimaar.com", passwordHash: await bcrypt.hash("chulimaar-admin", 10), role: "owner" }, update: {} });
    await db.adminUser.upsert({ where: { email: "cms-staff@example.invalid" }, create: { name: "CMS QA staff", email: "cms-staff@example.invalid", passwordHash: await bcrypt.hash("cms-test-staff", 10), role: "staff" }, update: {} });
    const actor = { userId: owner.id, name: owner.name };
    const auditBefore = await db.auditLog.count({ where: { entityId: HOMEPAGE_KEY } });
    const initialRevision = await persistHomepage(defaults, contentRevision(null), actor);
    const edited = structuredClone(defaults); edited.text.heroTitle = "CMS round-trip test"; edited.images.hero.url = "/chulimaar/brand/favicon-32.png"; edited.images.hero.position = "top"; edited.faqs.reverse();
    const editedRevision = await persistHomepage(edited, initialRevision, actor);
    assert.equal((await getHomepageContent()).text.heroTitle, "CMS round-trip test", "The public reader must use the saved content.");
    assert.equal((await getHomepageContent()).images.hero.position, "top");
    await assert.rejects(persistHomepage(defaults, initialRevision, actor), /CONTENT_CONFLICT/);
    const concurrentA = structuredClone(defaults); concurrentA.text.heroTitle = "Concurrent edit A";
    const concurrentB = structuredClone(defaults); concurrentB.text.heroTitle = "Concurrent edit B";
    const concurrent = await Promise.allSettled([persistHomepage(concurrentA, editedRevision, actor), persistHomepage(concurrentB, editedRevision, actor)]);
    assert.equal(concurrent.filter((result) => result.status === "fulfilled").length, 1, "Only one concurrent edit may win.");
    const current = await db.setting.findUniqueOrThrow({ where: { key: HOMEPAGE_KEY } });
    await persistHomepage(defaults, contentRevision(current.value), actor);
    assert.equal((await getHomepageContent()).images.hero.url, "", "Removing a photograph must restore the illustration.");
    assert.equal(await db.auditLog.count({ where: { entityId: HOMEPAGE_KEY } }), auditBefore + 4);
    console.log("Passed: schema validation, image/link restrictions, required alt text, durable content/public reads, crop and FAQ data, stale/concurrent save protection, photo removal and audit records.");
  } finally {
    if (!process.argv.includes("--keep-for-browser")) {
      assert(/^\/chulimaar_cms_qa/.test(url.pathname));
      await mongo.db().dropDatabase();
    }
    await mongo.close(); await db.$disconnect();
  }
}
main().then(() => process.exit(0)).catch((error) => { console.error(error instanceof Error ? error.message : "CMS QA failed."); process.exit(1); });

/** Integration checks use a new, isolated local database; never the catalogue DB. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

async function main() {
  const originalUrl = process.env.DATABASE_URL;
  assert(originalUrl, "DATABASE_URL must be configured.");
  const testUrl = new URL(originalUrl);
  assert(["localhost", "127.0.0.1"].includes(testUrl.hostname), "These checks only run on local MongoDB.");
  const testName = `chulimaar_test_${randomBytes(8).toString("hex")}`;
  testUrl.pathname = `/${testName}`;
  process.env.DATABASE_URL = testUrl.toString();
  const { db } = await import("../src/lib/db");
  const { SignupSchema, saveLaunchSignup, consumeSignupLimit } = await import("../src/lib/launch-signup");
  try {
    await db.$runCommandRaw({ createIndexes: "LaunchSubscriber", indexes: [{ key: { email: 1 }, name: "email_unique", unique: true }, { key: { removalTokenHash: 1 }, name: "removal_unique", unique: true }] });
    assert.equal(SignupSchema.safeParse({ email: "invalid", firstName: "", city: "", website: "" }).success, false);
    assert.equal(SignupSchema.safeParse({ email: "test@example.invalid", firstName: "", city: "", website: "spam" }).success, false);
    assert.equal(SignupSchema.safeParse({ email: "test@example.invalid", firstName: "x".repeat(81), city: "", website: "" }).success, false);
    const input = SignupSchema.parse({ email: "  EARLY@example.invalid  ", firstName: "  Founder  ", city: "  Skardu  ", website: "" });
    const saved = await saveLaunchSignup(input);
    assert.equal(saved.ok, true, saved.message);
    assert.match(saved.removalToken || "", /^[a-f0-9]{64}$/);
    assert.match(saved.conversionEventId || "", /^[a-f0-9]{32}$/);
    assert.notEqual(saved.conversionEventId, saved.removalToken, "Advertising IDs must not expose private removal credentials.");
    const row = await db.launchSubscriber.findUniqueOrThrow({ where: { email: "early@example.invalid" } });
    assert.equal(row.firstName, "Founder");
    assert.equal(row.city, "Skardu");
    assert.equal(row.noticeVersion, "2026-10-14-v1");
    const duplicate = await saveLaunchSignup(input);
    assert.equal(duplicate.ok, true);
    assert.equal(duplicate.removalToken, undefined, "Repeat signups must not expose an existing removal token.");
    assert.equal(duplicate.conversionEventId, undefined, "Repeat signups must not count as new advertising leads.");
    assert.equal(await db.launchSubscriber.count(), 1);
    const racers = await Promise.all([saveLaunchSignup({ ...input, email: "race@example.invalid" }), saveLaunchSignup({ ...input, email: "race@example.invalid" })]);
    assert(racers.every((result) => result.ok));
    assert.equal(racers.filter(result => result.conversionEventId).length, 1, "Concurrent duplicate requests must produce only one lead.");
    assert.equal(await db.launchSubscriber.count({ where: { email: "race@example.invalid" } }), 1);
    assert.equal((await saveLaunchSignup({ email: "optional@example.invalid", firstName: "", city: "", website: "" })).ok, true);
    const optional = await db.launchSubscriber.findUniqueOrThrow({ where: { email: "optional@example.invalid" } });
    assert.equal(optional.firstName, null);
    const limits = await Promise.all(Array.from({ length: 8 }, () => consumeSignupLimit("concurrent-test", 3, 1800000000000)));
    assert.equal(limits.filter(Boolean).length, 3, "The rate limit must be atomic under concurrent attempts.");
    const raw = await db.$runCommandRaw({ find: "LaunchSignupLimit", filter: {}, limit: 1 }) as { cursor?: { firstBatch?: { expiresAt?: unknown }[] } };
    assert(raw.cursor?.firstBatch?.[0]?.expiresAt, "Expiry must be recorded.");
    const { placeOrder } = await import("../src/app/(site)/checkout/actions");
    assert.equal((await placeOrder({ ok: false }, new FormData())).ok, false);
    assert.equal(await db.order.count(), 0, "Pre-launch checkout must not create an order.");
    const { removeLaunchSignup } = await import("../src/app/(site)/launch-preferences/actions");
    const form = new FormData();
    form.set("token", saved.removalToken!);
    await assert.rejects(removeLaunchSignup(form), /NEXT_REDIRECT/);
    assert.equal(await db.launchSubscriber.count({ where: { email: input.email } }), 0);
    console.log("Passed: validation, optional fields, persistence, duplicate/concurrent signup, private removal, atomic rate limits and pre-launch checkout guard.");
  } finally {
    assert(new URL(process.env.DATABASE_URL!).pathname === `/${testName}` && testName.startsWith("chulimaar_test_"));
    await db.$runCommandRaw({ dropDatabase: 1 });
    await db.$disconnect();
    process.env.DATABASE_URL = originalUrl;
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Pre-launch checks failed."); process.exitCode = 1; });

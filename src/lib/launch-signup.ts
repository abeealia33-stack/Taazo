import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "./db";

export const NOTICE_VERSION = "2026-10-14-v1";
export type SignupState = { ok: boolean; message?: string; removalToken?: string; errors?: Record<string, string>; values?: { email: string; firstName: string; city: string } };
export const SignupSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Please enter a valid email address."),
  firstName: z.string().trim().max(80, "Please keep your name under 80 characters."),
  city: z.string().trim().max(100, "Please keep the city under 100 characters."),
  website: z.string().max(0, "We couldn't save your signup. Please try again."),
});

/** Atomic, database-backed windows work across server instances. No raw email/IP stored. */
export async function consumeSignupLimit(identity: string, limit: number, now = Date.now()) {
  const window = Math.floor(now / 600_000);
  const digest = createHash("sha256").update(identity).digest("hex");
  const result = await db.$runCommandRaw({
    findAndModify: "LaunchSignupLimit",
    query: { _id: `${digest}:${window}` },
    update: { $inc: { count: 1 }, $setOnInsert: { expiresAt: { $date: new Date((window + 2) * 600_000).toISOString() } } },
    upsert: true,
    new: true,
  }) as { value?: { count?: number } };
  return typeof result.value?.count === "number" && result.value.count <= limit;
}

export async function saveLaunchSignup(input: z.infer<typeof SignupSchema>, trustedIp?: string): Promise<SignupState> {
  try {
    if (trustedIp && !(await consumeSignupLimit(`ip:${trustedIp}`, 15))) {
      return { ok: false, message: "Too many signup attempts. Please try again in ten minutes." };
    }
    if (!(await consumeSignupLimit(`email:${input.email}`, 3))) {
      return { ok: false, message: "Please wait ten minutes before trying this address again." };
    }
    const removalToken = randomBytes(32).toString("hex");
    let created = false;
    try {
      await db.launchSubscriber.create({ data: {
        email: input.email,
        firstName: input.firstName || null,
        city: input.city || null,
        noticeVersion: NOTICE_VERSION,
        removalTokenHash: createHash("sha256").update(removalToken).digest("hex"),
      } });
      created = true;
    } catch (error) {
      // A unique index makes simultaneous and repeated signup requests idempotent.
      if (!(typeof error === "object" && error !== null && "code" in error && error.code === "P2002")) throw error;
    }
    return { ok: true, message: "You're on the list. We'll email you when our first batch is ready and orders open.", ...(created ? { removalToken } : {}) };
  } catch {
    // Avoid logging contact data, connection strings or database query payloads.
    return { ok: false, message: "We couldn't save your signup. Please try again." };
  }
}

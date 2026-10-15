/** Update one existing owner's login without reseeding catalogue or business data.
 * Reads { previousEmail, email, password } as JSON from stdin; never logs passwords.
 */
import { stdin } from "node:process";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma";

const inputSchema = z.object({
  previousEmail: z.string().email().transform((value) => value.trim().toLowerCase()),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(10).max(72),
});

async function main() {
  let raw = "";
  for await (const chunk of stdin) raw += chunk;
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { throw new Error("Provide the credential update as valid JSON on stdin."); }
  const parsed = inputSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Provide valid previousEmail, email and a password of 10–72 characters as JSON on stdin.");
  const input = parsed.data;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  const probe = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });
  try {
    await probe.connect();
    await probe.db().command({ ping: 1 });
  } catch {
    throw new Error("The configured MongoDB is unavailable. Start it, then rerun this credential update. No account changes were made.");
  } finally {
    await probe.close();
  }

  const db = new PrismaClient({ log: [] });
  try {
    const [previous, target] = await Promise.all([
      db.adminUser.findUnique({ where: { email: input.previousEmail } }),
      db.adminUser.findUnique({ where: { email: input.email } }),
    ]);
    if (previous && target && previous.id !== target.id) throw new Error("Both email addresses belong to different accounts; no changes were made.");
    const owner = previous || target;
    if (!owner || owner.role !== "owner") throw new Error("The existing owner account was not found; no changes were made.");
    const passwordHash = await bcrypt.hash(input.password, 10);
    const updated = await db.$transaction(async (tx) => {
      const user = await tx.adminUser.update({ where: { id: owner.id }, data: { email: input.email, passwordHash } });
      await tx.auditLog.create({ data: { actorName: "Local account maintenance", entity: "AdminUser", entityId: owner.id, action: "updated owner login credentials", detail: `Email changed from ${owner.email} to ${input.email}.` } });
      return user;
    });
    if (updated.email !== input.email || !(await bcrypt.compare(input.password, updated.passwordHash))) throw new Error("Credential verification failed.");
    console.log(`Updated and verified the existing owner login: ${updated.email}. Account ID, access, role and business data were preserved.`);
  } catch (error) {
    if (error instanceof Error && !('code' in error)) throw error;
    throw new Error("The database credential update failed. Check MongoDB connectivity and replica-set configuration.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Credential update failed.");
  process.exitCode = 1;
});

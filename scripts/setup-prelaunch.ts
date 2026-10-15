import { PrismaClient } from "../src/generated/prisma";

const db = new PrismaClient();
async function main() {
  await db.$runCommandRaw({ createIndexes: "LaunchSignupLimit", indexes: [{ key: { expiresAt: 1 }, name: "signup_limit_expiry", expireAfterSeconds: 0 }] });
  console.log("Pre-launch signup rate-limit expiry index is ready.");
}
main().catch(() => { console.error("Could not configure signup expiry. Check database connectivity."); process.exitCode = 1; }).finally(() => db.$disconnect());

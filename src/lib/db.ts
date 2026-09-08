import { PrismaClient } from "@/generated/prisma";

/**
 * A single Prisma client per process. Next.js hot-reloads modules in
 * development, so without the global cache each edit would open a new pool of
 * MongoDB connections until the server fell over.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

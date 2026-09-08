import { createHmac, timingSafeEqual, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

/**
 * Admin sessions.
 *
 * A deliberately small, auditable implementation rather than a third-party
 * auth framework: this panel has one or two users, credentials only, no social
 * login and no account recovery flow. A signed, HTTP-only cookie is the whole
 * requirement, and it has no beta dependency to break on the next Next.js
 * release.
 *
 * The cookie holds `userId.expiry.hmac`. It is signed, not encrypted — it
 * carries no secret, and the signature is what makes it unforgeable.
 */

const COOKIE = "taazo_admin";
const MAX_AGE_DAYS = 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set. Copy .env.example to .env.");
  }
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export type AdminSession = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "staff";
};

export async function createSession(userId: string) {
  const expires = Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  const token = `${payload}.${sign(payload)}`;

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Returns the signed-in admin, or null. Never throws. */
export async function getSession(): Promise<AdminSession | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;

    const [userId, expires, signature] = token.split(".");
    if (!userId || !expires || !signature) return null;
    if (!safeEqual(signature, sign(`${userId}.${expires}`))) return null;
    if (Number(expires) < Date.now()) return null;

    const user = await db.adminUser.findUnique({ where: { id: userId } });
    if (!user || !user.active) return null;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role === "staff" ? "staff" : "owner",
    };
  } catch {
    return null;
  }
}

/** Server-side guard. The UI hiding a control is never the security boundary. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Owner-only areas: prices, settings, revenue. */
export async function requireOwner(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.role !== "owner") redirect("/admin?denied=1");
  return session;
}

/**
 * Every state change is written down: who, what, when. In a cash business with
 * staff this matters more than it sounds.
 */
export async function audit(
  session: AdminSession | null,
  entity: string,
  entityId: string,
  action: string,
  detail?: string,
) {
  await db.auditLog.create({
    data: {
      actorId: session?.userId ?? null,
      actorName: session?.name ?? "system",
      entity,
      entityId,
      action,
      detail,
    },
  });
}

// ---- brute-force protection -------------------------------------------------
// In-memory and per-process, which is the right scope for a single-instance
// admin panel. It is a speed bump for password guessing, not a security model.

const attempts = new Map<string, { count: number; until: number }>();

export function loginBlocked(key: string) {
  const record = attempts.get(key);
  if (!record) return false;
  if (Date.now() > record.until) {
    attempts.delete(key);
    return false;
  }
  return record.count >= 5;
}

export function recordFailedLogin(key: string) {
  const record = attempts.get(key) ?? { count: 0, until: 0 };
  record.count += 1;
  record.until = Date.now() + 15 * 60 * 1000;
  attempts.set(key, record);
}

export function clearFailedLogins(key: string) {
  attempts.delete(key);
}

export { randomUUID };

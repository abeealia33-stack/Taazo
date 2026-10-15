"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  loginBlocked,
  recordFailedLogin,
  clearFailedLogins,
  audit,
  getSession,
  getAdminLoginSetupError,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const setupError = getAdminLoginSetupError();
  if (setupError) return { error: setupError };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const head = await headers();
  const key = head.get("x-forwarded-for") ?? email;

  if (loginBlocked(key)) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  try {
    const user = await db.adminUser.findUnique({ where: { email } });

    // The same message either way — never reveal which half was wrong.
    const generic = "That email and password do not match.";

    if (!user || !user.active) {
      recordFailedLogin(key);
      return { error: generic };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      recordFailedLogin(key);
      return { error: generic };
    }

    await db.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await audit(
      { userId: user.id, name: user.name, email: user.email, role: "owner" },
      "AdminUser",
      user.id,
      "signed in",
    );
    // Do not issue a session when a required database write failed.
    await createSession(user.id);
    clearFailedLogins(key);
  } catch (error) {
    // Database errors can contain connection details or submitted addresses.
    console.error("Admin sign-in service unavailable.", error instanceof Error ? error.name : "UnknownError");
    return { error: "Admin sign-in is temporarily unavailable. Please try again shortly." };
  }

  // redirect throws a control-flow exception; keep it outside error handling.
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  if (session) {
    await audit(session, "AdminUser", session.userId, "signed out");
  }
  await destroySession();
  redirect("/admin/login");
}

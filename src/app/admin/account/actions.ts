"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireOwner, audit, destroySession } from "@/lib/auth";

/**
 * Admin accounts.
 *
 * The seed creates an owner with a password that is written in plaintext in
 * prisma/seed.ts, so anyone who can read the repository knows it. Being able to
 * change it is not a nice-to-have.
 */

export type AccountState = { ok?: string; error?: string };

const PasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z
      .string()
      .min(10, "Use at least 10 characters — this guards every order you have"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: "The two new passwords do not match",
    path: ["confirm"],
  });

export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await requireAdmin();

  const parsed = PasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  }

  const user = await db.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!valid) return { error: "That is not your current password." };

  if (await bcrypt.compare(parsed.data.next, user.passwordHash)) {
    return { error: "That is the password you already have." };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 10) },
  });

  await audit(session, "AdminUser", user.id, "changed password");
  revalidatePath("/admin/account");

  return { ok: "Password changed. It applies the next time you sign in." };
}

const StaffSchema = z.object({
  name: z.string().min(2, "Give them a name"),
  email: z.string().email("That email does not look right"),
  password: z.string().min(10, "Use at least 10 characters"),
  role: z.enum(["owner", "staff"]),
});

export async function createStaff(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await requireOwner();

  const parsed = StaffSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: formData.get("password"),
    role: formData.get("role") ?? "staff",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  }

  const clash = await db.adminUser.findUnique({
    where: { email: parsed.data.email },
  });
  if (clash) return { error: "Someone already uses that email." };

  const user = await db.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: parsed.data.role,
      active: true,
    },
  });

  await audit(session, "AdminUser", user.id, `created ${parsed.data.role}`, parsed.data.email);
  revalidatePath("/admin/account");

  return { ok: `${parsed.data.name} can now sign in.` };
}

export async function toggleStaff(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("userId") ?? "");

  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) return;

  // Locking yourself out is the one mistake this panel should not allow.
  if (user.id === session.userId) return;

  // Nor should the last remaining owner be disabled.
  if (user.role === "owner" && user.active) {
    const owners = await db.adminUser.count({
      where: { role: "owner", active: true },
    });
    if (owners <= 1) return;
  }

  await db.adminUser.update({
    where: { id },
    data: { active: !user.active },
  });

  await audit(
    session,
    "AdminUser",
    id,
    user.active ? "access revoked" : "access restored",
    user.email,
  );
  revalidatePath("/admin/account");
}

/** Signs the current user out of this device. */
export async function signOutEverywhere() {
  const session = await requireAdmin();
  await audit(session, "AdminUser", session.userId, "signed out");
  await destroySession();
  revalidatePath("/admin");
}

"use server";
import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function removeLaunchSignup(formData: FormData) {
  const token = String(formData.get("token") || "");
  if (!/^[a-f0-9]{64}$/.test(token)) redirect("/launch-preferences?invalid=1");
  try {
    await db.launchSubscriber.deleteMany({ where: { removalTokenHash: createHash("sha256").update(token).digest("hex") } });
  } catch { redirect(`/launch-preferences?token=${token}&error=1`); }
  redirect("/launch-preferences?removed=1");
}

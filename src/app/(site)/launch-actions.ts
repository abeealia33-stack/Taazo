"use server";

import { headers } from "next/headers";
import { SignupSchema, saveLaunchSignup, type SignupState } from "@/lib/launch-signup";

export async function joinLaunchList(_previous: SignupState, formData: FormData): Promise<SignupState> {
  const values = {
    email: String(formData.get("email") ?? "").slice(0, 1000),
    firstName: String(formData.get("firstName") ?? "").slice(0, 1000),
    city: String(formData.get("city") ?? "").slice(0, 1000),
  };
  const parsed = SignupSchema.safeParse({ ...values, website: String(formData.get("website") ?? "") });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: errors.website || "Please check the highlighted fields.", errors, values };
  }
  // Only trust a forwarding header when a deployment's proxy is known to overwrite it.
  const requestHeaders = await headers();
  const headerName = process.env.CHULIMAAR_TRUSTED_IP_HEADER;
  const trustedIp = headerName ? requestHeaders.get(headerName)?.split(",")[0]?.trim() : undefined;
  const result = await saveLaunchSignup(parsed.data, trustedIp);
  return { ...result, values };
}

"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { homepageSchema, PHOTO_FIELDS, TEXT_FIELDS } from "@/lib/homepage-schema";
import { persistHomepage } from "@/lib/homepage-content";

export async function saveHomepage(raw: string, revision: string) {
  const owner = await requireOwner();
  if (typeof raw !== "string" || raw.length > 200_000 || !/^[a-f0-9]{64}$/.test(revision)) return { ok: false, message: "The content could not be read. Reload the editor and try again." };
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return { ok: false, message: "The content could not be read." }; }
  const parsed = homepageSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    let label = TEXT_FIELDS.find((field) => field.key === issue?.path[1])?.label || "Content";
    if (issue?.path[0] === "images") label = `${PHOTO_FIELDS.find((field) => field.key === issue.path[1])?.label || "Photograph"}: ${issue.path[2] === "alt" ? "image description" : "details"}`;
    if (issue?.path[0] === "faqs") label = `FAQ ${typeof issue.path[1] === "number" ? issue.path[1] + 1 : "list"}${issue.path[2] === "answer" ? " answer" : " question"}`;
    if (issue?.path[0] === "contact") label = issue.path[1] === "instagram" ? "Instagram profile" : issue.path[1] === "whatsapp" ? "WhatsApp number" : "Contact email";
    return { ok: false, message: `${label}: ${issue?.message || "Please check this value."}` };
  }
  try {
    const nextRevision = await persistHomepage(parsed.data, revision, owner);
    revalidatePath("/", "layout");
    revalidatePath("/admin/website");
    return { ok: true, message: "Saved. Your website is updated.", revision: nextRevision };
  } catch (error) {
    const conflict = error instanceof Error && (error.message === "CONTENT_CONFLICT" || ("code" in error && ["P2002", "P2034"].includes(String(error.code))));
    return { ok: false, message: conflict ? "Someone else saved changes while you were editing. Open the editor in a new tab to review the latest version before continuing." : "We couldn't save your changes. Check the database connection and try again. Your edits are still here." };
  }
}

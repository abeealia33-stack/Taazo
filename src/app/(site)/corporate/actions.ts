"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { mailer } from "@/lib/mailer";

const LeadSchema = z.object({
  company: z.string().min(2, "Please tell us the company or family name"),
  contactName: z.string().min(2, "Please tell us your name"),
  phone: z
    .string()
    .regex(/^0?3\d{2}[\s-]?\d{7}$/, "Enter a Pakistani mobile number"),
  email: z.string().email("That email does not look right").optional().or(z.literal("")),
  headcount: z.coerce.number().int().min(1).max(100000).optional(),
  budget: z.string().max(80).optional(),
  occasion: z.string().max(80).optional(),
  eventDate: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export type LeadState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const parsed = LeadSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;

  try {
    await db.corporateLead.create({
      data: {
        company: data.company,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email || null,
        headcount: data.headcount ?? null,
        budget: data.budget || null,
        occasion: data.occasion || null,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        message: data.message || null,
        status: "new",
      },
    });

    await mailer.send({
      to: process.env.ORDER_NOTIFY_EMAIL || "orders@taazo.pk",
      subject: `Bulk enquiry — ${data.company}`,
      text: [
        `${data.contactName} at ${data.company}`,
        `${data.phone}${data.email ? ` · ${data.email}` : ""}`,
        "",
        `Occasion:  ${data.occasion ?? "—"}`,
        `Headcount: ${data.headcount ?? "—"}`,
        `Budget:    ${data.budget ?? "—"}`,
        `Date:      ${data.eventDate ?? "—"}`,
        "",
        data.message ?? "",
      ].join("\n"),
    });

    return { ok: true };
  } catch (error) {
    console.error("submitLead failed", error);
    return {
      ok: false,
      error: "We could not save that. Please WhatsApp us instead.",
    };
  }
}

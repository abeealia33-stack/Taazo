"use client";

import { useActionState } from "react";
import { submitLead, type LeadState } from "./actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const initial: LeadState = { ok: false };

const OCCASIONS = [
  "Wedding",
  "Eid",
  "Corporate gifting",
  "Office pantry",
  "Event",
  "Something else",
];

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-olive p-9 text-center text-cream">
        <h2 className="display-tight text-3xl">We&rsquo;ve got it</h2>
        <p className="mx-auto mt-4 max-w-md text-cream/75">
          Someone will call you within a working day with pricing and a delivery
          plan. If it&rsquo;s urgent, WhatsApp is faster.
        </p>
        <ButtonLink
          href={whatsappLink("Hi taazo! I just sent a bulk enquiry —")}
          className="mt-7"
          size="lg"
        >
          message us now
        </ButtonLink>
      </div>
    );
  }

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-terracotta/40 bg-terracotta/8 px-5 py-4 text-sm text-terracotta-deep"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company or family name" name="company" error={err("company")} required />
        <Field label="Your name" name="contactName" error={err("contactName")} required />
        <Field
          label="Mobile number"
          name="phone"
          type="tel"
          placeholder="0300 1234567"
          error={err("phone")}
          required
        />
        <Field label="Email" name="email" type="email" error={err("email")} />

        <label className="flex flex-col gap-2">
          <span className="text-sm text-sand-700">Occasion</span>
          <select
            name="occasion"
            className="rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal focus:border-terracotta focus:outline-none"
          >
            {OCCASIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>

        <Field
          label="How many boxes / people"
          name="headcount"
          type="number"
          placeholder="50"
          error={err("headcount")}
        />
        <Field label="Budget per box" name="budget" placeholder="Rs 2,000–3,000" />
        <Field label="Date needed" name="eventDate" type="date" />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-sand-700">
          Anything else <span className="text-sand-500">(optional)</span>
        </span>
        <textarea
          name="message"
          rows={4}
          placeholder="Delivery across two locations, branded cards, a specific flavour mix…"
          className="resize-none rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-sand-400 focus:border-terracotta focus:outline-none"
        />
      </label>

      <Button type="submit" size="lg" className="w-fit" disabled={pending}>
        {pending ? "sending…" : "send enquiry"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-sand-700">
        {label} {required && <span className="text-terracotta">*</span>}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "rounded-lg border bg-cream px-4 py-3 text-base text-charcoal placeholder:text-sand-400 focus:outline-none",
          error ? "border-terracotta" : "border-sand-300 focus:border-terracotta",
        )}
      />
      {error && (
        <span id={`${name}-error`} role="alert" className="text-xs text-terracotta-deep">
          {error}
        </span>
      )}
    </label>
  );
}

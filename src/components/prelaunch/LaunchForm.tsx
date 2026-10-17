"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { joinLaunchList } from "@/app/(site)/launch-actions";
import type { SignupState } from "@/lib/launch-signup";
import type { HomepageText } from "@/lib/homepage-schema";
import { trackLaunchLead } from "@/lib/meta-pixel";

const initialState: SignupState = { ok: false };

export function LaunchForm({ text }: { text: Pick<HomepageText, "submitLabel" | "successTitle" | "successBody"> }) {
  const [state, action, pending] = useActionState(joinLaunchList, initialState);
  // Controlled fields survive React's form reset when a server action returns an error.
  const [values, setValues] = useState({ email: "", firstName: "", city: "" });
  useEffect(() => { trackLaunchLead(state); }, [state]);
  return <div className="cm-launch-form">
    {state.ok ? <div className="cm-success" role="status" aria-live="polite"><p className="cm-eyebrow">A place at the beginning</p><h3>{text.successTitle}</h3><p>{text.successBody}</p>{state.removalToken && <p className="cm-consent">Keep your <a href={`/launch-preferences?token=${state.removalToken}`}>private removal link</a> if you want to delete this signup later.</p>}</div> : (
      <form action={action}>
        <label htmlFor="launch-email">Email address</label>
        <input id="launch-email" type="email" name="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} aria-invalid={Boolean(state.errors?.email)} aria-describedby={state.errors?.email ? "email-error" : undefined} />
        {state.errors?.email && <p id="email-error" className="cm-form-error">{state.errors.email}</p>}
        <div className="cm-form-row">
          <div><label htmlFor="launch-name">First name <span>(optional)</span></label><input id="launch-name" name="firstName" maxLength={80} autoComplete="given-name" value={values.firstName} onChange={(event) => setValues({ ...values, firstName: event.target.value })} aria-invalid={Boolean(state.errors?.firstName)} aria-describedby={state.errors?.firstName ? "name-error" : undefined} />{state.errors?.firstName && <p id="name-error" className="cm-form-error">{state.errors.firstName}</p>}</div>
          <div><label htmlFor="launch-city">City <span>(optional)</span></label><input id="launch-city" name="city" maxLength={100} autoComplete="address-level2" value={values.city} onChange={(event) => setValues({ ...values, city: event.target.value })} aria-invalid={Boolean(state.errors?.city)} aria-describedby={state.errors?.city ? "city-error" : undefined} />{state.errors?.city && <p id="city-error" className="cm-form-error">{state.errors.city}</p>}</div>
        </div>
        <div className="cm-honeypot" aria-hidden="true"><label htmlFor="launch-website">Leave this field empty</label><input id="launch-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <button className="cm-button" type="submit" disabled={pending}>{pending ? "Saving your signup…" : text.submitLabel}<span aria-hidden="true">→</span></button>
        <p className="cm-consent">By signing up, you agree to receive Chulimaar launch updates by email. You can unsubscribe from any update. Read our <Link href="/privacy">privacy policy</Link>.</p>
        {state.message && <p className="cm-form-error" role="alert">{state.message}</p>}
      </form>
    )}
  </div>;
}

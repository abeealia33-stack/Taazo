"use client";

import { useActionState, useState } from "react";
import { ChevronDown, KeyRound, UserPlus } from "lucide-react";
import { changePassword, createStaff, type AccountState } from "./actions";

const initial: AccountState = {};
function Notice({ state }: { state: AccountState }) {
  return state.error ? <p role="alert" className="admin-notice admin-notice-error">{state.error}</p> : state.ok ? <p role="status" className="admin-notice admin-notice-success">{state.ok}</p> : null;
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);
  const [open, setOpen] = useState(false);
  return <section className="admin-panel">
    <h2>Password</h2><p className="admin-description">Keep your account secure with a password you use only here.</p>
    <button type="button" className="admin-button admin-button-secondary mt-5" aria-expanded={open} aria-controls="change-password-fields" onClick={() => setOpen(!open)} disabled={pending}><KeyRound size={16} aria-hidden="true" />Change password<ChevronDown size={15} aria-hidden="true" /></button>
    <div id="change-password-fields" hidden={!open}><form action={action} className="admin-account-form">
      <Notice state={state} />
      <label className="admin-field">Current password<input type="password" name="current" autoComplete="current-password" required disabled={pending} className="admin-input" /></label>
      <label className="admin-field">New password<input type="password" name="next" autoComplete="new-password" required minLength={10} disabled={pending} className="admin-input" /><span className="admin-muted">Use at least 10 characters.</span></label>
      <label className="admin-field">Repeat new password<input type="password" name="confirm" autoComplete="new-password" required minLength={10} disabled={pending} className="admin-input" /></label>
      <button disabled={pending} className="admin-button">{pending ? "Changing password…" : "Update password"}</button>
    </form></div>
  </section>;
}

export function AddStaffForm() {
  const [state, action, pending] = useActionState(createStaff, initial);
  const [open, setOpen] = useState(false);
  return <div className="mt-5 border-t border-sand-200 pt-5">
    <button type="button" className="admin-button admin-button-secondary" aria-expanded={open} aria-controls="add-member-fields" onClick={() => setOpen(!open)} disabled={pending}><UserPlus size={16} aria-hidden="true" />Add team member</button>
    <div id="add-member-fields" hidden={!open}><form action={action} className="admin-account-form">
      <p className="admin-muted">Staff can use operational order and delivery tools. Only owners can edit the website, view signups or manage team access.</p>
      <Notice state={state} />
      <label className="admin-field">Full name<input name="name" required autoComplete="name" placeholder="Full name" disabled={pending} className="admin-input" /></label>
      <label className="admin-field">Email address<input type="email" name="email" required autoComplete="email" placeholder="name@example.com" disabled={pending} className="admin-input" /></label>
      <label className="admin-field">Temporary password<input type="password" name="password" autoComplete="new-password" required minLength={10} disabled={pending} className="admin-input" /><span className="admin-muted">At least 10 characters. Share it privately with this person.</span></label>
      <label className="admin-field">Access level<select name="role" defaultValue="staff" disabled={pending} className="admin-input"><option value="staff">Staff — limited access</option><option value="owner">Owner — full access</option></select></label>
      <button disabled={pending} className="admin-button">{pending ? "Adding team member…" : "Create account"}</button>
    </form></div>
  </div>;
}

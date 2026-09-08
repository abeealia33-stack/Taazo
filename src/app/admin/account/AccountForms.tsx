"use client";

import { useActionState } from "react";
import { changePassword, createStaff, type AccountState } from "./actions";
import { Card } from "@/components/admin/ui";

const initial: AccountState = {};
const field =
  "rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm focus:border-terracotta focus:outline-none";

function Notice({ state }: { state: AccountState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-terracotta/40 bg-terracotta/8 px-4 py-3 text-sm text-terracotta-deep"
      >
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p
        role="status"
        className="rounded-lg border border-olive/40 bg-olive/8 px-4 py-3 text-sm text-olive"
      >
        {state.ok}
      </p>
    );
  }
  return null;
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);

  return (
    <Card>
      <h2 className="text-lg tracking-tight text-charcoal">Your password</h2>
      <p className="mt-1 text-sm text-sand-600">
        The seeded password is written in plaintext in{" "}
        <code className="text-charcoal">prisma/seed.ts</code>, so anyone who can
        read this project knows it. Change it.
      </p>

      <form action={action} className="mt-5 flex max-w-sm flex-col gap-3">
        <Notice state={state} />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-sand-600">Current password</span>
          <input
            type="password"
            name="current"
            autoComplete="current-password"
            required
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-sand-600">New password</span>
          <input
            type="password"
            name="next"
            autoComplete="new-password"
            required
            minLength={10}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-sand-600">Repeat new password</span>
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            required
            minLength={10}
            className={field}
          />
        </label>
        <button
          disabled={pending}
          className="mt-1 w-fit rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800 disabled:opacity-50"
        >
          {pending ? "changing…" : "change password"}
        </button>
      </form>
    </Card>
  );
}

export function AddStaffForm() {
  const [state, action, pending] = useActionState(createStaff, initial);

  return (
    <Card className="border-terracotta/25 bg-terracotta/[0.04]">
      <h2 className="text-lg tracking-tight text-charcoal">Add someone</h2>
      <p className="mt-1 text-sm text-sand-600">
        Staff can run orders, batches and deliveries. They cannot see revenue,
        change prices, or touch settings.
      </p>

      <form action={action} className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Notice state={state} />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-sand-600">Name</span>
          <input name="name" required placeholder="Bilal" className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-sand-600">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="bilal@taazo.pk"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-sand-600">Temporary password</span>
          <input
            name="password"
            required
            minLength={10}
            placeholder="at least 10 characters"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-sand-600">Role</span>
          <select name="role" defaultValue="staff" className={field}>
            <option value="staff">Staff — orders and deliveries</option>
            <option value="owner">Owner — everything</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <button
            disabled={pending}
            className="rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep disabled:opacity-50"
          >
            {pending ? "adding…" : "add person"}
          </button>
        </div>
      </form>
    </Card>
  );
}

"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/Button";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="mt-9 flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-terracotta/40 bg-terracotta/8 px-4 py-3 text-sm text-terracotta-deep"
        >
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm text-sand-700">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          className="rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal focus:border-terracotta focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-sand-700">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal focus:border-terracotta focus:outline-none"
        />
      </label>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? "signing in…" : "sign in"}
      </Button>
    </form>
  );
}

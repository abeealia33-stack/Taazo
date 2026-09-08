import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="grid min-h-[80vh] place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Wordmark className="mx-auto h-8 w-auto text-terracotta" decorative />
        <h1 className="mt-8 text-center text-2xl tracking-tight text-charcoal">
          Admin
        </h1>
        <p className="mt-2 text-center text-sm text-sand-600">
          Orders, batches and stock.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

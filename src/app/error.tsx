"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

/**
 * Root error boundary.
 *
 * Deliberately calm and on-brand rather than a stack trace: the customer can do
 * nothing with the error, but they can retry or reach us on WhatsApp.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server logs get the detail; the visitor does not need it.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-5 py-24 text-center">
      <div>
        <Wordmark className="mx-auto h-9 w-auto text-terracotta" decorative />
        <h1 className="display-tight mt-8 text-3xl text-charcoal md:text-4xl">
          Something spilled
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sand-700">
          That is on us, not you. Try again — and if it keeps happening,
          message us and we will take the order by hand.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep"
          >
            try again
          </button>
          <Link
            href="/"
            className="rounded-full bg-cream px-6 py-3 text-sm text-charcoal ring-1 ring-sand-300 transition-colors hover:bg-sand-100"
          >
            back home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-2xs uppercase tracking-[0.14em] text-sand-500">
            reference {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

/** Admin error boundary — shows the digest, since you are the one debugging. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-16">
      <h1 className="text-xl tracking-tight text-charcoal">
        This screen failed to load
      </h1>
      <p className="mt-2 max-w-lg text-sm text-sand-700">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-sand-500">reference {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800"
      >
        try again
      </button>
    </div>
  );
}

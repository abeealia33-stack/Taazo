/**
 * Storefront loading state.
 *
 * Brand-coloured skeletons rather than a spinner: a spinner says "wait", a
 * skeleton says "here is the shape of what is coming".
 */
export default function Loading() {
  return (
    <div className="container-taazo py-24" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-3 w-28 animate-pulse rounded-full bg-sand-200" />
      <div className="mt-6 h-12 w-2/3 animate-pulse rounded-lg bg-sand-200" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-sand-200" />
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square animate-pulse rounded-lg bg-sand-200" />
            <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-sand-200" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded-full bg-sand-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

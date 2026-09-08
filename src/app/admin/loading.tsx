/** Admin loading state — plain and fast, matching the rest of the panel. */
export default function AdminLoading() {
  return (
    <div className="py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-6 w-40 animate-pulse rounded-md bg-sand-200" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-sand-200 bg-sand-100"
          />
        ))}
      </div>
    </div>
  );
}

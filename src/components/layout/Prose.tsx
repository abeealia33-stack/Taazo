/**
 * Long-form text wrapper for policy and story pages.
 *
 * Kept as a component rather than a `prose` plugin so the typography stays on
 * the site's own scale and colour tokens.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        flex flex-col gap-5 text-base leading-relaxed text-sand-800
        [&_a]:text-terracotta [&_a]:underline [&_a]:underline-offset-4
        [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:tracking-tight [&_h2]:text-charcoal
        [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:text-charcoal
        [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1
        [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2
        [&_strong]:text-charcoal
      "
    >
      {children}
    </div>
  );
}

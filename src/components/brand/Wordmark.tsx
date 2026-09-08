/**
 * The taazo. wordmark.
 *
 * Drawn as geometric SVG paths rather than set in a live font, so it renders
 * pixel-identically on every browser, OS and print surface. This is the only
 * approved wordmark — the serif version on the older fruit-jar labels is
 * retired. Colour is inherited via `currentColor`.
 *
 * NOTE FOR ABEE: this is a faithful geometric reconstruction of the wordmark
 * on the carrot-juice and iced-tea labels. If you have the original vector
 * from your designer, replace the paths below with it and nothing else in the
 * codebase needs to change.
 */

/**
 * The wordmark glyphs alone, on a 390×128 canvas, with no <svg> wrapper.
 *
 * Lets the mark be embedded inside another drawing — the label band on the
 * process-section bottle, for instance — without duplicating the paths.
 */
export function WordmarkGlyphs({ strokeWidth = 15 }: { strokeWidth?: number }) {
  return (
    <>
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M34 10v70c0 13 9 24 24 24" pathLength={1} />
        <path d="M14 44h42" pathLength={1} />
        <circle cx={100} cy={74} r={26} pathLength={1} />
        <path d="M126 44v60" pathLength={1} />
        <circle cx={172} cy={74} r={26} pathLength={1} />
        <path d="M198 44v60" pathLength={1} />
        <path d="M218 46h50l-50 56h52" pathLength={1} />
        <circle cx={312} cy={74} r={26} pathLength={1} />
      </g>
      <circle
        cx={360}
        cy={96}
        r={8.5}
        fill="currentColor"
        data-wordmark-dot=""
        style={{ transformOrigin: "360px 96px" }}
      />
    </>
  );
}

type WordmarkProps = {
  className?: string;
  /** Hide from assistive tech when the name is already announced nearby. */
  decorative?: boolean;
};

export function Wordmark({ className, decorative = false }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 390 128"
      className={className}
      fill="none"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "taazo."}
    >
      {!decorative && <title>taazo.</title>}
      <WordmarkGlyphs />
    </svg>
  );
}

/**
 * Square monogram for favicons, app icons and the WhatsApp avatar —
 * anywhere the full wordmark would be illegible below ~80px.
 */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" aria-hidden>
      <rect width={64} height={64} rx={16} fill="var(--color-terracotta)" />
      <g
        stroke="var(--color-cream)"
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M26 14v27c0 5 3.5 9 9 9" />
        <path d="M18 26h16" />
      </g>
      <circle cx={45} cy={46} r={4} fill="var(--color-cream)" />
    </svg>
  );
}

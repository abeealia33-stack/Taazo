import { artwork, wordmark, logoLayout, artworkFill, BRAND_COLORS, type LogoVariant, type LogoTone } from "@/lib/brand-system";

export function Logo({ variant = "horizontal", tone = "color", className = "", decorative = false }: {
  variant?: LogoVariant; tone?: LogoTone; className?: string; decorative?: boolean;
}) {
  const layout = logoLayout(variant);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width} height={layout.height}
      className={`cm-brand-logo cm-brand-${variant} ${className}`}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : "Chulimaar"}
      aria-hidden={decorative || undefined}
    >
      <g transform={layout.artworkTransform}>
        {artwork.filter((path) => variant === "stacked" || path.part === "symbol").map((path, index) => (
          <path key={index} d={path.d} transform={path.transform} fill={artworkFill(path.role, tone)} />
        ))}
      </g>
      {variant !== "icon" && <g transform={layout.wordmarkTransform}>
        {wordmark.paths.map((path, index) => <path key={index} d={path.d} fill={tone === "mono" ? "currentColor" : path.period ? BRAND_COLORS.orange : tone === "reversed" ? BRAND_COLORS.cream : BRAND_COLORS.brown} />)}
      </g>}
    </svg>
  );
}

/** Shared artwork without a repeated wordmark, reserved for the hero. */
export function BrandArtwork({ ridgeOnly = false, className = "" }: { ridgeOnly?: boolean; className?: string }) {
  return <svg viewBox="185 305 900 470" className={`cm-brand-artwork ${className}`} aria-hidden="true">
    {artwork.filter((path) => !ridgeOnly || path.part === "ridge").map((path, index) => <path key={index} d={path.d} transform={path.transform} fill={artworkFill(path.role, "color")} />)}
  </svg>;
}

export function BrandDivider() {
  return <div className="cm-container cm-brand-divider" aria-hidden="true"><span /><Logo variant="icon" tone="mono" decorative /><span /></div>;
}

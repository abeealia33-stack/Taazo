import artwork from "@/data/chulimaar-artwork.json";
import wordmark from "@/data/chulimaar-wordmark.json";

export type LogoVariant = "horizontal" | "stacked" | "icon";
export type LogoTone = "color" | "reversed" | "mono";

export const BRAND_COLORS = {
  cream: "#FDFCF6", page: "#F7F2E7", brown: "#542912",
  orange: "#DC803F", olive: "#737745", sandStart: "#E8DDCB", sandEnd: "#E5B77F",
} as const;

const wordScale = 0.328;
const wordWidth = wordmark.bounds.width * wordScale;
const wordHeight = wordmark.bounds.height * wordScale;

export function logoLayout(variant: LogoVariant) {
  if (variant === "horizontal") return {
    width: 36 + 12 + wordWidth + 36, height: 72,
    artworkTransform: "translate(18 18) scale(0.0888889) translate(-425 -373)",
    wordmarkTransform: `translate(66 ${(72 - wordHeight) / 2}) scale(${wordScale}) translate(${-wordmark.bounds.x} ${-wordmark.bounds.y})`,
  };
  if (variant === "stacked") return {
    width: 320, height: 280,
    artworkTransform: "translate(50 50) scale(0.259) translate(-200 -329)",
    wordmarkTransform: `translate(${(320 - wordWidth * 1.5) / 2} 192) scale(${wordScale * 1.5}) translate(${-wordmark.bounds.x} ${-wordmark.bounds.y})`,
  };
  return { width: 405, height: 405, artworkTransform: "translate(-425 -373)", wordmarkTransform: "" };
}

export function artworkFill(role: string, tone: LogoTone) {
  if (tone === "mono") return "currentColor";
  if (role === "orange") return BRAND_COLORS.orange;
  if (role === "olive") return BRAND_COLORS.olive;
  return tone === "reversed" ? BRAND_COLORS.cream : BRAND_COLORS.brown;
}

export { artwork, wordmark };

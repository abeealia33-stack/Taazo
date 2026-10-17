export const DEFAULT_PRODUCT_IMAGE = "/chulimaar/product/apricot-kernel-oil-cutout.png";

// Only the supplied bottle belongs to this angle set. Custom owner photographs
// must never show somebody else's side/back pictures.
export function hasSuppliedBottleViews(url: string) {
  return url === DEFAULT_PRODUCT_IMAGE || url === "/chulimaar/product/apricot-kernel-oil.png";
}

export const PRODUCT_VIEWS = [
  { id: "front", label: "Front", src: DEFAULT_PRODUCT_IMAGE },
  { id: "angled-front", label: "Angled front", src: "/chulimaar/product/bottle-angled-front-cutout.png" },
  { id: "side", label: "Side", src: "/chulimaar/product/bottle-side-cutout.png" },
  { id: "back", label: "Back", src: "/chulimaar/product/bottle-back-cutout.png" },
] as const;

export function wrapProductView(index: number) {
  return ((index % PRODUCT_VIEWS.length) + PRODUCT_VIEWS.length) % PRODUCT_VIEWS.length;
}

// One view per deliberate horizontal gesture; no guessed intermediate angles.
export function productDragSteps(distance: number, width: number) {
  return Math.trunc(distance / Math.max(36, width / 5));
}

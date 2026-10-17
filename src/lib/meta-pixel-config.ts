// Pixel IDs are public identifiers, not access tokens. Keep production tracking
// scoped to the approved website; local previews never send advertising events.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2547720862399018";
export const META_PIXEL_HOST = "deepskyblue-dove-264491.hostingersite.com";

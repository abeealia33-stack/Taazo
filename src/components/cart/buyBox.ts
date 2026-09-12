const BUY_BOX_ATTR = "data-buybox";

/**
 * How the product page and the sticky buy bar find each other.
 *
 * A server component cannot hand a ref to a client one, so the two sides meet
 * through the DOM instead. This lives in its own module rather than beside the
 * bar because a `"use client"` file's exports reach a server component as
 * client references, not values — spreading one of those silently renders
 * nothing at all.
 */
export const buyBoxAnchor = { [BUY_BOX_ATTR]: true };

export const buyBoxSelector = `[${BUY_BOX_ATTR}]`;

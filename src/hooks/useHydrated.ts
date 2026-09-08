"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server render and the first client render, true afterwards.
 *
 * Anything restored from localStorage — the cart, above all — must not be
 * rendered until this is true, or the markup will mismatch on hydration. Using
 * useSyncExternalStore rather than a setState-in-effect avoids the extra render
 * pass and keeps React's lint rules happy.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

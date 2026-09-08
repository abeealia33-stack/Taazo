"use client";

import { useEffect } from "react";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

/**
 * Lenis inertial scrolling.
 *
 * Deliberately conservative:
 *  - the library is imported dynamically, so it never blocks first paint
 *  - it is skipped entirely on touch devices, where inertial scroll fights
 *    the OS and feels broken
 *  - it is skipped under prefers-reduced-motion
 *
 * Exposes `window.__lenis` so the cart drawer and modals can stop and start
 * scrolling without prop-drilling an instance through the tree.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;

    let raf = 0;
    let cancelled = false;
    let instance: { raf: (t: number) => void; destroy: () => void } | null = null;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      const lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
      });

      instance = lenis;
      window.__lenis = lenis;

      const tick = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      instance?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

/** Pause and resume page scroll — used by the cart drawer and any modal. */
export function lockScroll(locked: boolean) {
  const lenis = typeof window !== "undefined" ? window.__lenis : undefined;
  if (lenis) {
    if (locked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }
  if (typeof document !== "undefined") {
    document.body.style.overflow = locked ? "hidden" : "";
  }
}

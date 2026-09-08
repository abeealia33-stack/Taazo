/**
 * Motion constants and environment checks.
 *
 * These mirror the CSS custom properties in globals.css so that CSS
 * transitions and GSAP tweens stay in step. Change a duration here and in
 * globals.css together.
 */

export const DUR = {
  instant: 0.12,
  fast: 0.22,
  base: 0.38,
  slow: 0.64,
  reveal: 0.9,
} as const;

export const EASE = {
  outSoft: "power3.out",
  inOutSoft: "power2.inOut",
  spring: "back.out(1.7)",
} as const;

/** Stagger used for grids and lists, in seconds. */
export const STAGGER = 0.075;

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Inertial scrolling fights the OS on touch devices, so Lenis is desktop-only.
 * Pointer coarseness is a better signal than screen width.
 */
export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/** True when we should animate at all. */
export function shouldAnimate() {
  return !prefersReducedMotion();
}

/**
 * Loads GSAP and ScrollTrigger on demand. Never import gsap at module scope in
 * a component — it would land in the initial bundle and delay the hero.
 */
export async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

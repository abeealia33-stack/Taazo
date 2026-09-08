import type Lenis from "lenis";

declare global {
  interface Window {
    /** Set by <SmoothScroll />. Absent on touch devices and under reduced motion. */
    __lenis?: Lenis;
  }
}

export {};

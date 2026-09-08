"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait after entering the viewport. Use for manual sequencing. */
  delay?: number;
  /** Stagger direct children instead of animating the wrapper as one block. */
  stagger?: boolean;
  as?: ElementType;
};

/**
 * Scroll reveal built on IntersectionObserver and CSS transitions — no GSAP.
 *
 * The overwhelming majority of reveals on the site are a simple rise-and-fade,
 * and paying 60KB of animation library for that would be indefensible. GSAP is
 * loaded only by the few sections that genuinely need scrubbing or pinning.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = false,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets: HTMLElement[] = stagger
      ? (Array.from(el.children) as HTMLElement[])
      : [el];

    // Under reduced motion, show everything immediately — no transform, no wait.
    if (prefersReducedMotion()) {
      targets.forEach((t) => {
        t.classList.remove("reveal-init");
        t.classList.add("reveal-in");
      });
      return;
    }

    targets.forEach((t) => t.classList.add("reveal-init"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = targets.indexOf(entry.target as HTMLElement);
          const wait = delay + (stagger ? Math.max(index, 0) * 0.075 : 0);
          (entry.target as HTMLElement).style.transitionDelay = `${wait}s`;
          entry.target.classList.remove("reveal-init");
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [delay, stagger]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

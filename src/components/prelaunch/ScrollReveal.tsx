"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

export function useScrollReveal(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled || !window.IntersectionObserver) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-reveal-item]")];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        (entry.target as HTMLElement).dataset.reveal = "shown";
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    for (const node of nodes) {
      node.dataset.reveal = node.getBoundingClientRect().top < innerHeight ? "shown" : "waiting";
      if (node.dataset.reveal === "waiting") observer.observe(node);
    }
    return () => { observer.disconnect(); for (const node of nodes) delete node.dataset.reveal; };
  }, [ref, enabled]);
}

export function ScrollReveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useScrollReveal(root);
  return <div ref={root} className={className}>{children}</div>;
}

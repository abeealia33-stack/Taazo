"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/motion";
import { WordmarkGlyphs } from "@/components/brand/Wordmark";

const STEPS = [
  {
    time: "5:30 AM",
    title: "Sourcing",
    body: "Fruit is picked up from the mandi and from orchards across Punjab before the city is awake. What is good that morning decides what we press that morning.",
  },
  {
    time: "6:40 AM",
    title: "Pressing",
    body: "Washed, cut and cold-pressed in small batches. No heat, no concentrate, no water. Every batch gets a code, and that code follows the bottle to your door.",
  },
  {
    time: "8:00 AM",
    title: "Bottling",
    body: "Sealed, labelled and packed on ice. Out for delivery the same morning, because juice this fresh has no interest in waiting for you.",
  },
];

/**
 * The pressing sequence: a bottle fills with juice and the label writes itself
 * on as you scroll through the three steps.
 *
 * PINNING IS DONE IN CSS, NOT GSAP — deliberately.
 *
 * ScrollTrigger's `pin: true` physically re-parents the pinned element into a
 * generated `pin-spacer` wrapper. React has no idea that happened, so the next
 * time it tries to remove or replace that node it calls removeChild against a
 * parent that is no longer the node's parent, and throws
 * "The node to be removed is not a child of this node".
 *
 * `position: sticky` produces the same visual result with no DOM manipulation
 * at all, so React's tree stays exactly as React rendered it. GSAP is then used
 * only for what it is genuinely needed for here: reading scroll progress and
 * scrubbing the fill and the wordmark against it.
 */
export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<SVGRectElement>(null);
  const markRef = useRef<SVGGElement>(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;
    // The tall sticky track only exists at lg; below that it is a plain stack.
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !sectionRef.current) return;

      /**
       * Each stroked shape carries pathLength={1}, so one dash value works for
       * every letter regardless of its real length. Fully offset means blank.
       */
      const strokes = markRef.current
        ? Array.from(
            markRef.current.querySelectorAll<SVGGeometryElement>("path, circle"),
          ).filter((el) => !el.hasAttribute("data-wordmark-dot"))
        : [];
      const dot = markRef.current?.querySelector<SVGCircleElement>(
        "[data-wordmark-dot]",
      );

      strokes.forEach((el) => {
        el.style.strokeDasharray = "1";
        el.style.strokeDashoffset = "1";
      });
      if (dot) {
        dot.style.transform = "scale(0)";
        dot.style.opacity = "0";
      }

      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current!,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            setActive(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));

            if (fillRef.current) {
              // The bottle fills from the bottom: y falls as height grows.
              const h = 8 + p * 150;
              fillRef.current.setAttribute("height", String(h));
              fillRef.current.setAttribute("y", String(182 - h));
            }

            // The label writes itself on, letter after letter.
            const drawWindow = Math.min(1, p / 0.65);
            strokes.forEach((el, index) => {
              const start = index / strokes.length;
              const end = (index + 1) / strokes.length;
              const local = Math.min(
                1,
                Math.max(0, (drawWindow - start) / (end - start)),
              );
              el.style.strokeDashoffset = String(1 - local);
            });

            // The full stop is the brand's signature, so it lands last.
            if (dot) {
              const pop = Math.min(1, Math.max(0, (p - 0.68) / 0.14));
              dot.style.opacity = String(pop);
              const scale = pop === 0 ? 0 : 1 + Math.sin(pop * Math.PI) * 0.35;
              dot.style.transform = `scale(${pop < 1 ? scale * pop : 1})`;
            }
          },
        });
      }, sectionRef.current);

      setEnhanced(true);

      cleanup = () => {
        // revert() undoes every inline style GSAP set. Because nothing was
        // pinned, there is no wrapper element to unwind.
        ctx.revert();
        strokes.forEach((el) => {
          el.style.strokeDasharray = "";
          el.style.strokeDashoffset = "";
        });
        if (dot) {
          dot.style.transform = "";
          dot.style.opacity = "";
        }
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative lg:h-[240vh]"
      aria-label="How taazo is made"
    >
      {/* Sticky, not pinned — see the note above the component. */}
      <div className="container-taazo flex items-center py-24 lg:sticky lg:top-0 lg:h-screen lg:py-0">
        <div className="grid w-full gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex justify-center">
            <svg
              viewBox="0 0 140 200"
              className="h-64 w-auto lg:h-80"
              aria-hidden
              fill="none"
            >
              <defs>
                <clipPath id="bottle-clip">
                  <path d="M56 10h28v24c0 9 5 13 12 20 9 9 14 18 14 31v97c0 6-4 10-10 10H40c-6 0-10-4-10-10V85c0-13 5-22 14-31 7-7 12-11 12-20V10Z" />
                </clipPath>
              </defs>

              {/* the juice */}
              <g clipPath="url(#bottle-clip)">
                <rect
                  x={0}
                  y={174}
                  width={140}
                  height={8}
                  fill="var(--color-fruit-carrot)"
                  ref={fillRef}
                />
              </g>

              {/* the glass */}
              <path
                d="M56 10h28v24c0 9 5 13 12 20 9 9 14 18 14 31v97c0 6-4 10-10 10H40c-6 0-10-4-10-10V85c0-13 5-22 14-31 7-7 12-11 12-20V10Z"
                stroke="var(--color-charcoal)"
                strokeWidth={2.5}
              />
              <rect
                x={52}
                y={2}
                width={36}
                height={12}
                rx={3}
                fill="var(--color-charcoal)"
              />

              {/* the label band, with the wordmark on it */}
              <rect
                x={30}
                y={118}
                width={80}
                height={40}
                fill="var(--color-cream)"
                opacity={0.96}
              />
              <g
                ref={markRef}
                transform="translate(41 130) scale(0.153)"
                className="text-terracotta"
              >
                <WordmarkGlyphs strokeWidth={26} />
              </g>
            </svg>
          </div>

          <ol className="flex flex-col gap-8">
            {STEPS.map((step, i) => {
              const isActive = !enhanced || i === active;
              return (
                <li
                  key={step.title}
                  className="grid grid-cols-[auto_1fr] gap-x-6 transition-opacity duration-[var(--dur-slow)]"
                  style={{ opacity: isActive ? 1 : 0.32 }}
                  aria-current={enhanced && i === active ? "step" : undefined}
                >
                  <span className="pt-1 text-2xs uppercase tracking-[0.16em] tabular-nums text-terracotta">
                    {step.time}
                  </span>
                  <div>
                    <h3 className="display-tight text-2xl text-charcoal md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-base text-sand-700">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

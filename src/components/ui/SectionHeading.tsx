import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  tone?: "default" | "inverse";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  align = "left",
  tone = "default",
  className,
}: Props) {
  const inverse = tone === "inverse";

  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow && (
          <p
            className={cn(
              "text-2xs uppercase tracking-[0.2em]",
              inverse ? "text-cream/60" : "text-sand-500",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "display-tight mt-4 text-3xl md:text-4xl",
            inverse ? "text-cream" : "text-charcoal",
          )}
        >
          {title}
        </h2>
        {intro && (
          <p
            className={cn(
              "mt-5 text-lg",
              inverse ? "text-cream/75" : "text-sand-700",
            )}
          >
            {intro}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 text-sm transition-colors",
            inverse
              ? "text-cream/80 hover:text-cream"
              : "text-charcoal/70 hover:text-terracotta",
          )}
        >
          {action.label}
          <span
            aria-hidden
            className="transition-transform duration-[var(--dur-fast)] ease-(--ease-out-soft) group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      )}
    </Reveal>
  );
}

import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
};

/** The standard top-of-page block. Keeps every inner page in the same rhythm. */
export function PageHeader({ eyebrow, title, intro, className }: Props) {
  return (
    <header className={cn("container-taazo pb-14 pt-14 md:pb-20 md:pt-24", className)}>
      {eyebrow && (
        <p
          className="hero-fade text-2xs uppercase tracking-[0.2em] text-sand-500"
          style={{ animationDelay: "60ms" }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className="hero-fade display-tight mt-4 max-w-3xl text-4xl text-charcoal md:text-5xl lg:text-6xl"
        style={{ animationDelay: "140ms" }}
      >
        {title}
      </h1>
      {intro && (
        <p
          className="hero-fade mt-6 max-w-2xl text-lg text-sand-700"
          style={{ animationDelay: "240ms" }}
        >
          {intro}
        </p>
      )}
    </header>
  );
}

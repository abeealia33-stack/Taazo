import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "olive";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight " +
  "transition-[transform,background-color,color,box-shadow] duration-[var(--dur-fast)] " +
  "ease-(--ease-out-soft) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta text-cream shadow-sm hover:bg-terracotta-deep hover:shadow-md",
  secondary:
    "bg-cream text-charcoal ring-1 ring-sand-300 hover:bg-sand-100 hover:ring-sand-400",
  ghost: "text-charcoal hover:bg-sand-200/70",
  olive: "bg-olive text-cream shadow-sm hover:bg-olive-light hover:shadow-md",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}

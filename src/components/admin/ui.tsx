import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl tracking-tight text-charcoal">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-sand-600">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="rounded-full bg-charcoal px-4 py-2 text-sm text-cream transition-colors hover:bg-sand-800"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-sand-200 bg-cream p-5 shadow-xs",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "alert" | "good";
}) {
  return (
    <Card className="min-w-0">
      <p className="text-2xs uppercase tracking-[0.14em] text-sand-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl tabular-nums tracking-tight",
          tone === "alert" && "text-terracotta",
          tone === "good" && "text-olive",
          tone === "default" && "text-charcoal",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-sand-600">{hint}</p>}
    </Card>
  );
}

const STATUS_TONES: Record<string, string> = {
  pending: "bg-gold/20 text-sand-800",
  confirmed: "bg-olive/15 text-olive",
  packed: "bg-olive/15 text-olive",
  out_for_delivery: "bg-terracotta/15 text-terracotta-deep",
  delivered: "bg-olive text-cream",
  failed: "bg-terracotta text-cream",
  cancelled: "bg-sand-300 text-sand-700",
  verified: "bg-olive/15 text-olive",
  rejected: "bg-terracotta/15 text-terracotta-deep",
};

export function StatusPill({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-2xs uppercase tracking-[0.1em]",
        STATUS_TONES[status] ?? "bg-sand-200 text-sand-700",
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <Card className="py-16 text-center">
      <p className="text-lg text-charcoal">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-sm text-sm text-sand-600">{body}</p>}
    </Card>
  );
}

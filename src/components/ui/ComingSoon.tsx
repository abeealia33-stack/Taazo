import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Coming soon" states.
 *
 * Used in two places: a channel that has not been set up yet (an Instagram
 * account that does not exist), and a page whose content has not been added
 * yet (no reels uploaded, an empty category).
 *
 * In both cases the point is the same — never render a link to nowhere. A dead
 * link costs trust; an honest "not yet" costs nothing, and WhatsApp is always
 * offered as the thing that does work today.
 */

/** Inline replacement for a link whose destination does not exist yet. */
export function ComingSoonTag({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-sand-500", className)}
    >
      {label}
      <span className="rounded-full bg-sand-200 px-2 py-0.5 text-2xs uppercase tracking-[0.12em] text-sand-600">
        soon
      </span>
    </span>
  );
}

/** Page-level empty state. */
export function ComingSoon({
  title,
  body,
  whatsappMessage = "Hi taazo!",
  showShop = true,
}: {
  title: string;
  body: string;
  whatsappMessage?: string;
  showShop?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center md:py-28">
      <span className="rounded-full bg-sand-200 px-4 py-1.5 text-2xs uppercase tracking-[0.18em] text-sand-600">
        coming soon
      </span>
      <h2 className="display-tight max-w-lg text-3xl text-charcoal md:text-4xl">
        {title}
      </h2>
      <p className="max-w-md text-base text-sand-700">{body}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {showShop && (
          <ButtonLink href="/shop" size="lg">
            see today&rsquo;s batch
          </ButtonLink>
        )}
        <ButtonLink
          href={whatsappLink(whatsappMessage)}
          size="lg"
          variant="secondary"
        >
          message us on WhatsApp
        </ButtonLink>
      </div>
    </div>
  );
}

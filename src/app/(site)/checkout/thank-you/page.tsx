import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/utils";
import { whatsappLink, SITE } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/brand/Wordmark";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ o?: string }>;
}) {
  const { o } = await searchParams;
  if (!o) notFound();

  const order = await db.order.findUnique({ where: { orderNumber: o } });
  if (!order) notFound();

  const deliveryDate = order.deliveryDate.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Karachi",
  });

  return (
    <div className="container-narrow py-20 md:py-28">
      <div className="text-center">
        <Wordmark className="mx-auto h-9 w-auto text-terracotta" decorative />
        <h1 className="display-tight mt-9 text-4xl text-charcoal md:text-5xl">
          Thank you — it&rsquo;s in
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-sand-700">
          We&rsquo;ll confirm on WhatsApp shortly. Your bottles come from batch{" "}
          <span className="text-charcoal">{order.batchCode ?? "today's press"}</span>.
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-sand-100 p-7 ring-1 ring-sand-200 md:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-sand-300/70 pb-5">
          <div>
            <p className="text-2xs uppercase tracking-[0.18em] text-sand-500">
              order number
            </p>
            <p className="mt-1 text-2xl tabular-nums tracking-tight text-charcoal">
              {order.orderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xs uppercase tracking-[0.18em] text-sand-500">
              arriving
            </p>
            <p className="mt-1 text-base text-charcoal">
              {deliveryDate}, {order.deliverySlot}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-3 py-5 text-sm">
          {order.items.map((item, i) => (
            <li key={`${item.productSlug}-${i}`} className="flex justify-between gap-4">
              <span className="text-sand-700">
                <span className="tabular-nums">{item.qty}×</span>{" "}
                {item.nameSnapshot}
                {item.noteCard && (
                  <span className="mt-0.5 block text-xs italic text-sand-600">
                    card: &ldquo;{item.noteCard}&rdquo;
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap tabular-nums text-charcoal">
                {formatPKR(item.priceSnapshot * item.qty)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 border-t border-sand-300/70 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-sand-700">Subtotal</dt>
            <dd className="tabular-nums">{formatPKR(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sand-700">Delivery</dt>
            <dd className="tabular-nums">
              {order.deliveryFee === 0 ? "Free" : formatPKR(order.deliveryFee)}
            </dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-sand-300/70 pt-4 text-base">
            <dt className="text-charcoal">
              Total{" "}
              <span className="text-sm text-sand-600">
                ({order.paymentMethod === "cod" ? "cash on delivery" : "transfer"})
              </span>
            </dt>
            <dd className="text-xl tabular-nums text-charcoal">
              {formatPKR(order.total)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink
          href={whatsappLink(
            `Hi taazo! This is about order ${order.orderNumber}.`,
          )}
          size="lg"
          variant="olive"
        >
          message us on WhatsApp
        </ButtonLink>
        <ButtonLink href={`/track?o=${order.orderNumber}`} size="lg" variant="secondary">
          track this order
        </ButtonLink>
      </div>

      <p className="mt-8 text-center text-sm text-sand-600">
        Questions? {SITE.phoneDisplay} ·{" "}
        <Link href="/faq" className="underline underline-offset-2">
          freshness &amp; delivery
        </Link>
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { STATUS_LABELS, STATUS_FLOW } from "@/lib/orders";
import { formatPKR, cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Look up a taazo order with your order number.",
};

export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ o?: string; phone?: string }>;
}) {
  const { o, phone } = await searchParams;

  // Phone is identity here — an order number alone must not expose an address.
  const order =
    o && phone
      ? await db.order.findFirst({
          where: {
            orderNumber: o.trim().toUpperCase(),
            phone: { contains: phone.trim().slice(-7) },
          },
        })
      : o
        ? await db.order.findUnique({ where: { orderNumber: o.trim().toUpperCase() } })
        : null;

  const notFound = Boolean(o) && !order;
  const currentIndex = order ? STATUS_FLOW.indexOf(order.status as never) : -1;

  return (
    <>
      <PageHeader
        eyebrow="track"
        title="Where is my order?"
        intro="Enter the order number from your confirmation. It looks like TZ-0609-0001."
      />

      <div className="container-narrow pb-24">
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm text-sand-700">Order number</span>
            <input
              name="o"
              defaultValue={o ?? ""}
              placeholder="TZ-0609-0001"
              className="rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base uppercase text-charcoal placeholder:text-sand-400 placeholder:normal-case focus:border-terracotta focus:outline-none"
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm text-sand-700">
              Mobile number <span className="text-sand-500">(optional)</span>
            </span>
            <input
              name="phone"
              defaultValue={phone ?? ""}
              placeholder="0300 1234567"
              className="rounded-lg border border-sand-300 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-sand-400 focus:border-terracotta focus:outline-none"
            />
          </label>
          <Button type="submit" size="lg" className="sm:w-auto">
            find it
          </Button>
        </form>

        {notFound && (
          <p
            role="alert"
            className="mt-8 rounded-lg border border-terracotta/40 bg-terracotta/8 px-5 py-4 text-sm text-terracotta-deep"
          >
            We could not find that order. Check the number, or{" "}
            <a
              href={whatsappLink("Hi taazo! I cannot find my order —")}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              message us on WhatsApp
            </a>
            .
          </p>
        )}

        {order && (
          <div className="mt-12 rounded-2xl bg-sand-100 p-7 ring-1 ring-sand-200 md:p-9">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-2xs uppercase tracking-[0.18em] text-sand-500">
                  {order.orderNumber}
                </p>
                <p className="mt-1 text-2xl tracking-tight text-charcoal">
                  {STATUS_LABELS[order.status] ?? order.status}
                </p>
              </div>
              <p className="text-sm text-sand-600">
                Batch {order.batchCode ?? "—"} · {formatPKR(order.total)}
              </p>
            </div>

            {order.status === "failed" || order.status === "cancelled" ? (
              <p className="mt-6 rounded-lg bg-cream px-5 py-4 text-sm text-sand-700">
                This order is marked{" "}
                <span className="text-charcoal">
                  {STATUS_LABELS[order.status]}
                </span>
                . Message us on WhatsApp and we will sort it out.
              </p>
            ) : (
              <ol className="mt-8 flex flex-col gap-0">
                {STATUS_FLOW.map((step, i) => {
                  const done = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  return (
                    <li key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full text-2xs",
                            done
                              ? "bg-terracotta text-cream"
                              : "bg-sand-300 text-sand-600",
                          )}
                          aria-hidden
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        {i < STATUS_FLOW.length - 1 && (
                          <span
                            className={cn(
                              "w-px flex-1",
                              i < currentIndex ? "bg-terracotta" : "bg-sand-300",
                            )}
                          />
                        )}
                      </div>
                      <div className="pb-7">
                        <p
                          className={cn(
                            "text-base",
                            isCurrent
                              ? "text-charcoal"
                              : done
                                ? "text-sand-700"
                                : "text-sand-500",
                          )}
                        >
                          {STATUS_LABELS[step]}
                        </p>
                        {isCurrent && (
                          <p className="mt-1 text-sm text-sand-600">
                            {step === "pending" &&
                              "We have your order and will confirm on WhatsApp."}
                            {step === "confirmed" &&
                              "Confirmed — it goes out with the next run."}
                            {step === "packed" && "Packed on ice and ready."}
                            {step === "out_for_delivery" &&
                              "On its way to you now."}
                            {step === "delivered" &&
                              "Delivered. Enjoy it cold."}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}
      </div>
    </>
  );
}

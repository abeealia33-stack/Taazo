import type { Metadata } from "next";
import { randomUUID } from "crypto";
import { getZones, getSetting } from "@/lib/orders";
import { isBeforeCutoff, todaysBatch } from "@/lib/batch";
import { CheckoutForm } from "./CheckoutForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type BankDetails = {
  bank: string;
  accountTitle: string;
  accountNumber: string;
  jazzCash: string;
};

export default async function CheckoutPage() {
  const [zones, freeOver, cutoffHour, bank] = await Promise.all([
    getZones(),
    getSetting("freeDeliveryOver", 3000),
    getSetting("sameDayCutoffHour", 13),
    getSetting<BankDetails>("bankDetails", {
      bank: "—",
      accountTitle: "taazo",
      accountNumber: "—",
      jazzCash: "—",
    }),
  ]);

  const sameDay = isBeforeCutoff(cutoffHour);
  const batch = todaysBatch();

  return (
    <>
      <PageHeader
        eyebrow="checkout"
        title="Almost yours"
        intro={
          sameDay
            ? `Order now and it arrives today from batch ${batch.code}.`
            : "Today's deliveries have closed — this order goes out with tomorrow morning's batch."
        }
      />

      <div className="container-taazo pb-24">
        <CheckoutForm
          zones={zones.map((z) => ({
            id: z.id,
            name: z.name,
            areas: z.areas,
            fee: z.fee,
            minOrder: z.minOrder,
          }))}
          freeOver={freeOver}
          bank={bank}
          sameDay={sameDay}
          idempotencyKey={randomUUID()}
        />
      </div>
    </>
  );
}

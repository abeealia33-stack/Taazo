import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDeliverySummary } from "@/lib/orders";
import { CartView } from "./CartView";

export const metadata: Metadata = {
  title: "Your basket",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const delivery = await getDeliverySummary();

  return (
    <>
      <PageHeader
        eyebrow="basket"
        title="Your basket"
        intro="Everything here is from today's batch. Nothing is held over to tomorrow."
      />
      <div className="container-taazo pb-24">
        <CartView deliveryFrom={delivery.from} freeOver={delivery.freeOver} />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getReels } from "@/lib/media";
import { ReelPlayer } from "@/components/home/ReelPlayer";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "From the kitchen",
  description:
    "Sourcing, pressing and packing at taazo — filmed as it happens in Lahore.",
};

export const revalidate = 60;

export default async function ReelsPage() {
  const reels = await getReels(60);

  return (
    <>
      <PageHeader
        eyebrow="from the kitchen"
        title="Filmed as it happens"
        intro="No studio, no stylist. Just what the mornings actually look like — the mandi run, the press, the packing on ice."
      />

      <div className="container-taazo pb-24">
        {reels.length === 0 ? (
          <ComingSoon
            title="Nothing filmed yet"
            body="We press every morning regardless. The camera will catch up — until then, ask us anything directly."
            whatsappMessage="Hi taazo! When are you posting from the kitchen?"
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reels.map((reel) => (
              <li key={reel.id}>
                <ReelPlayer reel={reel} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

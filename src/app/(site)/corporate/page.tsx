import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeadForm } from "./LeadForm";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Corporate & bulk",
  description:
    "Bulk gifting boxes for weddings, Eid, corporate clients and office pantries in Lahore. Tell us the headcount and the date.",
};

const POINTS = [
  {
    title: "Weddings",
    body: "Mayun mornings and mehndi afternoons, plus thank-you boxes for the people who did the work. We deliver to more than one address on the same day.",
  },
  {
    title: "Corporate gifting",
    body: "Eid and year-end boxes for clients and staff. Your card, our packing, delivered cold to each desk or each door.",
  },
  {
    title: "Office pantries",
    body: "A standing order two or three mornings a week. Priced per bottle, invoiced monthly, no minimum fuss.",
  },
];

export default function CorporatePage() {
  return (
    <>
      <PageHeader
        eyebrow="corporate & bulk"
        title="Ordering more than twelve"
        intro="Volume pricing, a delivery plan that respects your date, and cold-chain packing that survives a wedding hall. Tell us what you need and someone will call within a working day."
      />

      <div className="container-taazo grid gap-14 pb-24 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
        <LeadForm />

        <Reveal className="flex flex-col gap-5">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="rounded-xl bg-sand-100 p-6 ring-1 ring-sand-200"
            >
              <h2 className="text-lg tracking-tight text-charcoal">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-sand-700">
                {p.body}
              </p>
            </div>
          ))}
          <p className="px-1 text-sm leading-relaxed text-sand-600">
            For orders over a hundred boxes we will want a week&rsquo;s notice —
            the fruit has to be reserved with the growers, not just bought on the
            morning.
          </p>
        </Reveal>
      </div>
    </>
  );
}

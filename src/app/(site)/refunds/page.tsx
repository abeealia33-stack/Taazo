import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refunds & replacements",
  description:
    "What happens if a taazo order arrives warm, late, wrong or damaged.",
};

/**
 * ⚠ NOT LEGAL ADVICE, and the promises here are commercial decisions — Abee,
 * check every one of them is something you are willing to honour before launch.
 * A payment gateway application will ask for this page.
 */
export default function RefundsPage() {
  return (
    <>
      <PageHeader
        eyebrow="refunds & replacements"
        title="If something is wrong, tell us today"
        intro="Everything we make is perishable, so problems have to be raised quickly. Within that, we would rather replace it than argue about it."
      />
      <div className="container-narrow pb-24">
        <Prose>
          <h2>Arrived warm, damaged, or leaking</h2>
          <p>
            Message us on WhatsApp the same day with your order number and a
            photo. We replace it on the next delivery run, at no cost. We do not
            ask you to send it back.
          </p>

          <h2>Wrong item, or something missing</h2>
          <p>
            Same again — same day, order number, photo. We send the correct item
            on the next run, or refund that line if you would rather.
          </p>

          <h2>Changed your mind</h2>
          <p>
            You can change or cancel any order up until it is packed. Once it is
            packed, we cannot take fresh juice back — it cannot be resold, and
            it will not keep. This is the one place we have to be firm.
          </p>

          <h2>Delivery failed</h2>
          <p>
            If nobody is available and we cannot reach you, we hold the order
            and contact you to reschedule. Because the goods are perishable, an
            order that fails twice may not be refundable.
          </p>

          <h2>How refunds are paid</h2>
          <p>
            Bank or JazzCash transfers are refunded to the account they came
            from, usually within three working days. Cash-on-delivery orders are
            refunded by transfer to a number you give us, or as credit against
            your next order if you prefer.
          </p>

          <h2>Gift boxes</h2>
          <p>
            If a gift box arrives damaged or on the wrong date, we replace the
            box. Tell us within a day of the delivery date.
          </p>

          <h2>Reaching us</h2>
          <p>
            <a
              href={whatsappLink("Hi taazo! I have a problem with my order —")}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {SITE.phoneDisplay}
            </a>{" "}
            is fastest, and it is where we resolve almost everything.
            {SITE.email ? (
              <>
                {" "}
                Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> also
                works.
              </>
            ) : null}
          </p>
        </Prose>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms you order under at taazo.",
};

/**
 * ⚠ NOT LEGAL ADVICE — have this reviewed before launch. It describes what the
 * site and the business actually do today.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="terms"
        title="Ordering from taazo"
        intro="Plainly written, because terms nobody reads protect nobody."
      />
      <div className="container-narrow pb-24">
        <Prose>
          <h2>Who we are</h2>
          <p>
            {SITE.name} presses and delivers fresh juice, fruit and iced tea in{" "}
            {SITE.city}. Reach us on WhatsApp at {SITE.phoneDisplay}
            {SITE.email ? (
              <>
                {" "}
                or by email at{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </>
            ) : null}
            .
          </p>

          <h2>Placing an order</h2>
          <p>
            An order is a request, not a contract, until we confirm it. We
            confirm on WhatsApp. If something you ordered has sold out we will
            tell you before the order goes out, and you can change it or cancel.
          </p>
          <p>
            Prices are in Pakistani Rupees and include tax where it applies.
            Delivery is charged by area and is always shown before you pay.
          </p>

          <h2>Same-day cutoff</h2>
          <p>
            Orders placed before the daily cutoff go out the same day. Anything
            after that is delivered with the next morning&rsquo;s batch. The
            cutoff for your area is shown at checkout.
          </p>

          <h2>Payment</h2>
          <p>
            Cash on delivery, or bank and JazzCash transfer with a screenshot of
            the receipt. For transfers, the order is prepared once we have
            verified the payment.
          </p>

          <h2>Delivery</h2>
          <p>
            We deliver within our listed areas in {SITE.city}. Someone needs to
            be reachable on the phone number given. If a delivery fails because
            nobody is available, we will contact you to reschedule; a repeated
            failure may mean the order is cancelled and, for perishable goods,
            not refunded.
          </p>

          <h2>Freshness and your responsibility</h2>
          <p>
            Everything is perishable and made without preservatives. Refrigerate
            it as soon as it arrives. Shelf life is on each product page.
          </p>

          <h2>Gifting orders</h2>
          <p>
            For gift boxes you are responsible for the recipient&rsquo;s address
            and for the note card text. We deliver on the date you choose, or
            the next available slot if that date is not possible.
          </p>

          <h2>If something goes wrong</h2>
          <p>
            Tell us the same day. See our{" "}
            <a href="/refunds">refunds and replacements</a> page.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms. The version on this page at the time you
            order is the one that applies.
          </p>
        </Prose>
      </div>
    </>
  );
}

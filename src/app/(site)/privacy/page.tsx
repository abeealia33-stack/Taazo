import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What taazo collects, why, and how long it is kept.",
};

/**
 * ⚠ NOT LEGAL ADVICE — Abee, have this reviewed before launch, especially if
 * you apply for a payment gateway. It is written to be accurate to what the
 * site actually does today; if that changes, this must change with it.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="privacy"
        title="What we keep, and why"
        intro="Short version: your name, phone and address so we can deliver, and nothing else. We do not sell data to anyone."
      />
      <div className="container-narrow pb-24">
        <Prose>
          <h2>What we collect</h2>
          <p>
            When you place an order we collect your name, mobile number,
            delivery address and area, your chosen delivery slot, and what you
            ordered. If you pay by bank transfer we also store the payment
            screenshot you upload.
          </p>
          <p>
            You do not need an account to order, so we do not hold a password
            or a profile for you.
          </p>

          <h2>Why we collect it</h2>
          <ul>
            <li>To deliver your order and to call you if the rider cannot find you.</li>
            <li>To confirm payment, in the case of a bank transfer.</li>
            <li>To keep a record of the sale, as any business must.</li>
          </ul>

          <h2>Who else sees it</h2>
          <p>
            The rider delivering your order sees your name, address and phone
            number, because they have to. Nobody else outside {SITE.name} does.
            We do not sell, rent or share your details for marketing.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Order records are kept for our accounts. Payment screenshots are
            deleted once the payment is verified and the order is delivered.
          </p>

          <h2>Messaging</h2>
          <p>
            We message you on WhatsApp about your own order. We do not add you
            to a marketing broadcast list without asking.
          </p>

          <h2>Your choices</h2>
          <p>
            Ask us to delete your details at any time and we will, except where
            we are required to keep a record of the sale.{" "}
            {SITE.email ? (
              <>
                Message us on WhatsApp or email{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
              </>
            ) : (
              <>
                Message us on{" "}
                <a
                  href={whatsappLink("Hi taazo! About my details —")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                .
              </>
            )}
          </p>

          <h2>Changes</h2>
          <p>
            If this changes we will update this page. It applies to orders
            placed through this website.
          </p>
        </Prose>
      </div>
    </>
  );
}

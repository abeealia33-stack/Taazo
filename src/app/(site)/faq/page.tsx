import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Freshness & delivery",
  description:
    "How long taazo juice keeps, how it is delivered cold, which areas of Lahore we reach, and what to do if a bottle arrives warm.",
};

import { getFaqGroups } from "@/lib/content";

export const revalidate = 60;

export default async function FaqPage() {
  const groups = await getFaqGroups();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="freshness & delivery"
        title="The questions people actually ask"
        intro="Short answers, and honest ones. If yours is not here, WhatsApp us — someone replies."
      />

      <div className="container-narrow flex flex-col gap-16 pb-24">
        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="text-2xs uppercase tracking-[0.2em] text-sand-500">
              {group.heading}
            </h2>
            <div className="mt-6 divide-y divide-sand-300/70 border-y border-sand-300/70">
              {group.items.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg tracking-tight text-charcoal marker:hidden">
                    {item.question}
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-terracotta transition-transform duration-[var(--dur-base)] ease-(--ease-out-soft) group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl pr-10 text-base leading-relaxed text-sand-700">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <p className="text-center text-base text-sand-700">
          Still stuck?{" "}
          <a
            href={whatsappLink("Hi taazo! I have a question —")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-terracotta underline-offset-4 hover:underline"
          >
            Message us on WhatsApp
          </a>{" "}
          or{" "}
          <Link
            href="/contact"
            className="text-terracotta underline-offset-4 hover:underline"
          >
            reach us another way
          </Link>
          .
        </p>
      </div>
    </>
  );
}

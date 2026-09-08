import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach taazo on WhatsApp, by phone or by email.",
};

/** Only channels that actually exist become links. */
const CHANNELS = [
  {
    label: "WhatsApp",
    detail: "Fastest. Someone replies during the day.",
    href: whatsappLink("Hi taazo!"),
    action: "start a chat",
    external: true,
  },
  {
    label: "Phone",
    detail: SITE.phoneDisplay,
    href: `tel:${SITE.phoneDisplay.replace(/\s/g, "")}`,
    action: "call us",
    external: false,
  },
  ...(SITE.email
    ? [
        {
          label: "Email",
          detail: SITE.email,
          href: `mailto:${SITE.email}`,
          action: "send an email",
          external: false,
        },
      ]
    : []),
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="contact"
        title="Talk to a person"
        intro="No ticket system, no chatbot. WhatsApp is the quickest way to reach us, and it is where most orders end up being sorted anyway."
      />

      <div className="container-narrow pb-24">
        <ul className="divide-y divide-sand-300/70 border-y border-sand-300/70">
          {CHANNELS.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="group flex items-center justify-between gap-6 py-6 transition-colors"
              >
                <div>
                  <p className="text-xl tracking-tight text-charcoal transition-colors group-hover:text-terracotta">
                    {c.label}
                  </p>
                  <p className="mt-1 text-sm text-sand-600">{c.detail}</p>
                </div>
                <span className="flex shrink-0 items-center gap-2 text-sm text-sand-600 transition-colors group-hover:text-terracotta">
                  {c.action}
                  <span
                    aria-hidden
                    className="transition-transform duration-[var(--dur-fast)] ease-(--ease-out-soft) group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-14 rounded-xl bg-sand-100 p-7 ring-1 ring-sand-200">
          <h2 className="text-lg tracking-tight text-charcoal">
            Where we are
          </h2>
          <p className="mt-3 text-base leading-relaxed text-sand-700">
            We press in {SITE.city} every morning and deliver across the city
            the same day. There is no shopfront to visit yet — everything goes
            out from the kitchen.
          </p>
          <p className="mt-4 text-sm text-sand-600">
            Orders and questions: {SITE.phoneDisplay}
            {SITE.email ? ` · ${SITE.email}` : ""}
          </p>

          {!SITE.email && (
            <p className="mt-3 text-sm text-sand-600">
              An email address is on the way. WhatsApp reaches us today.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

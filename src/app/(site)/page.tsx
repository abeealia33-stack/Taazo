import { getHomepageContent } from "@/lib/homepage-content";
import { MediaPanel } from "@/components/prelaunch/MediaPanel";
import { LaunchForm } from "@/components/prelaunch/LaunchForm";
import { BrandDivider } from "@/components/prelaunch/Logo";
import { HeroBanner } from "@/components/prelaunch/HeroBanner";
import { ProductShowcase } from "@/components/prelaunch/ProductShowcase";
import { ScrollReveal } from "@/components/prelaunch/ScrollReveal";
import { PHOTO_FIELDS, type HomepageContent, type PhotoKey } from "@/lib/homepage-schema";

export const metadata = { alternates: { canonical: "/" } };

function Photo({ image, slot, kind, priority = false }: { image: HomepageContent["images"]["hero"]; slot: PhotoKey; kind?: "hero" | "portrait"; priority?: boolean }) {
  const placeholderLabel = PHOTO_FIELDS.find((photo) => photo.key === slot)!.label;
  return <MediaPanel photo={image.url || null} alt={image.alt} label={image.caption} placeholderLabel={placeholderLabel} kind={kind} priority={priority} position={image.position} />;
}

export default async function HomePage() {
  const { text: t, images, faqs, hero, product } = await getHomepageContent();
  const steps = [
    { number: "01", title: t.kernelsTitle, body: t.kernelsBody, image: images.kernels, slot: "kernels" },
    { number: "02", title: t.pressingTitle, body: t.pressingBody, image: images.pressing, slot: "pressing" },
    { number: "03", title: t.bottleTitle, body: t.bottleBody, image: images.bottle, slot: "bottle" },
  ] as const;
  return <>
    <HeroBanner key={JSON.stringify(hero)} hero={hero} text={t} />
    <div className="cm-place-strip"><div className="cm-container"><span>{t.stripOne}</span><span>{t.stripTwo}</span><span>{t.stripThree}</span></div></div>
    <BrandDivider />
    <ProductShowcase image={images.oil} text={t} animation={product.animation} />
    <section className="cm-process cm-section" id="our-process" aria-labelledby="process-title"><div className="cm-container"><div className="cm-section-heading"><div><p className="cm-eyebrow">{t.processEyebrow}</p><h2 id="process-title">{t.processTitle} <em>{t.processTitleEm}</em></h2></div><p style={{ whiteSpace: "pre-line" }}>{t.processIntro}</p></div><ScrollReveal className="cm-steps">{steps.map((step) => <article key={step.number} data-reveal-item=""><Photo image={step.image} slot={step.slot} /><div className="cm-step-title"><span>{step.number}</span><h3>{step.title}</h3></div><p className="cm-body">{step.body}</p></article>)}</ScrollReveal></div></section>
    <BrandDivider />
    <section className="cm-container cm-section cm-story" id="our-story" aria-labelledby="story-title"><div className="cm-section-copy"><p className="cm-eyebrow">{t.founderEyebrow}</p><h2 id="story-title">{t.founderTitle}<br /><em>{t.founderTitleEm}</em></h2></div><div className="cm-founder-copy"><p className="cm-founder-quote">{t.founderQuote}</p><p className="cm-body">{t.founderBody}</p><p className="cm-founder-signature">{t.founderName}<span>{t.founderLocation}</span></p></div><Photo image={images.founder} slot="founder" kind="portrait" /></section>
    <section className="cm-launch" id="launch-updates" aria-labelledby="launch-title"><div className="cm-container cm-launch-inner"><div><p className="cm-eyebrow">{t.launchEyebrow}</p><h2 id="launch-title">{t.launchTitle}<br /><em>{t.launchTitleEm}</em></h2><p className="cm-body">{t.launchBody}</p></div><LaunchForm text={{ submitLabel: t.submitLabel, successTitle: t.successTitle, successBody: t.successBody }} /></div></section>
    <section className="cm-container cm-section cm-faq" id="faqs" aria-labelledby="faq-title"><div><p className="cm-eyebrow">{t.faqEyebrow}</p><h2 id="faq-title">{t.faqTitle} <em>{t.faqTitleEm}</em></h2><p className="cm-body">{t.faqBody}</p></div><div className="cm-faq-list">{faqs.map((faq, index) => <details key={`${index}-${faq.question}`}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>
  </>;
}

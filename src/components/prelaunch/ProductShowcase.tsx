"use client";

import { useId, useRef } from "react";
import { LaunchLink } from "./LaunchLink";
import { ArrowDown, ChevronDown, CookingPot, MapPin, Clock3 } from "lucide-react";
import type { HomepageContent, HomepageText } from "@/lib/homepage-schema";
import { ProductStage } from "./ProductStage";
import { useScrollReveal } from "./ScrollReveal";

export function ProductShowcase({ image, text: t, animation, preview = false }: { image: HomepageContent["images"]["oil"]; text: HomepageText; animation: boolean; preview?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const id = useId();
  useScrollReveal(root, animation);
  const titleId = preview ? `product-preview-title-${id}` : "oil-title";
  const facts = [
    { title: t.focusValue, label: t.focusLabel, value: t.focusValue, icon: CookingPot },
    { title: t.productionValue, label: t.productionLabel, value: t.productionValue, icon: MapPin },
    { title: t.availabilityLabel, label: t.availabilityLabel, value: t.availabilityValue, icon: Clock3 },
  ];

  return <section ref={root} id={preview ? undefined : "our-oil"} className={`cm-product-showcase${preview ? " cm-product-preview" : " cm-container cm-section"}`} aria-labelledby={titleId}>
    <div className="cm-product-heading" data-reveal-item="">{preview ? <><p className="cm-eyebrow">{t.oilEyebrow}</p><h3 id={titleId}>{t.oilTitle}<br /><em>{t.oilTitleEm}</em></h3></> : <><p className="cm-eyebrow">{t.oilEyebrow}</p><h2 id={titleId}>{t.oilTitle}<br /><em>{t.oilTitleEm}</em></h2></>}</div>
    <div className="cm-product-visual" data-reveal-item=""><ProductStage image={image} animation={animation} showControls={preview} /></div>
    <div className="cm-product-copy" data-reveal-item=""><p className="cm-body">{t.oilBody}</p><p className="cm-product-explore">Explore our first product</p>
      <div className="cm-product-facts">{facts.map((fact, index) => <details key={index} name={`product-facts-${id}`}><summary><fact.icon size={19} strokeWidth={1.5} aria-hidden="true" /><span>{fact.title}</span><ChevronDown className="cm-product-chevron" size={17} aria-hidden="true" /></summary><div><p className="cm-product-fact-label">{fact.label}</p><p>{fact.value}</p></div></details>)}</div>
      <p className="cm-small-note">{t.oilNote}</p>
      {preview ? <span className="cm-button cm-product-launch">{t.launchCta}<ArrowDown size={16} aria-hidden="true" /></span> : <LaunchLink className="cm-button cm-product-launch">{t.launchCta}<ArrowDown size={16} aria-hidden="true" /></LaunchLink>}
    </div>
  </section>;
}

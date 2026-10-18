import Link from "next/link";
import { GUIDE_LINKS } from "@/lib/seo";

export function OilGuides({ current }: { current?: string }) {
  return <section className="cm-oil-guides" aria-labelledby="oil-guides-title">
    <div className="cm-section-heading"><div><p className="cm-eyebrow">Get to know apricot oil</p><h2 id="oil-guides-title">A little more <em>understanding.</em></h2></div><p>Explore the oil, the questions behind it, and our beginning in Skardu.</p></div>
    <div className="cm-guide-cards">{GUIDE_LINKS.filter(link => link.href !== current).map(link => <Link className="cm-guide-card" key={link.href} href={link.href}><span className="cm-eyebrow">{link.label}</span><h3>{link.title}</h3><p>{link.description}</p><span className="cm-guide-card-cta">Read the guide <span aria-hidden="true">↗</span></span></Link>)}</div>
  </section>;
}

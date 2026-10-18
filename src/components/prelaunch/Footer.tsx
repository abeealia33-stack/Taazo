import Link from "next/link";
import { homepageLinks, type HomepageContent } from "@/lib/homepage-schema";
import { Logo } from "./Logo";
import { GUIDE_LINKS } from "@/lib/seo";
import { LaunchLink } from "./LaunchLink";

export function Footer({ content }: { content: HomepageContent }) {
  const { text, contact } = content;
  return (
    <footer className="cm-footer" id="contact"><div className="cm-container">
      <div className="cm-footer-top">
        <div className="cm-footer-brand"><Link href="/" aria-label="Chulimaar home"><Logo variant="stacked" tone="color" decorative /></Link><p style={{ whiteSpace: "pre-line" }}>{text.footerDescription}</p></div>
        <nav aria-label="Footer navigation">{homepageLinks(text).map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <div className="cm-footer-contact"><span className="cm-eyebrow">{text.footerLaunchLabel}</span><LaunchLink className="cm-text-link">{text.footerCta} <span aria-hidden="true">→</span></LaunchLink>
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}
          {contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
        </div>
      </div>
      <nav className="cm-footer-guides" aria-label="Apricot oil guides">{GUIDE_LINKS.map(link => <Link key={link.href} href={link.href}>{link.title}</Link>)}</nav>
      <div className="cm-footer-bottom"><p>© {new Date().getFullYear()} {text.footerCopyright}</p><Link href="/privacy">Privacy policy</Link><span>{text.footerNote}</span></div>
    </div></footer>
  );
}

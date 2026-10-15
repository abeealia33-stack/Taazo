import Link from "next/link";
import { homepageLinks, type HomepageContent } from "@/lib/homepage-schema";
import { Logo } from "./Logo";

export function Footer({ content }: { content: HomepageContent }) {
  const { text, contact } = content;
  return (
    <footer className="cm-footer" id="contact"><div className="cm-container">
      <div className="cm-footer-top">
        <div className="cm-footer-brand"><Link href="/" aria-label="Chulimaar home"><Logo variant="stacked" tone="color" decorative /></Link><p style={{ whiteSpace: "pre-line" }}>{text.footerDescription}</p></div>
        <nav aria-label="Footer navigation">{homepageLinks(text).map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <div className="cm-footer-contact"><span className="cm-eyebrow">{text.footerLaunchLabel}</span><Link className="cm-text-link" href="/#launch-updates">{text.footerCta} <span aria-hidden="true">→</span></Link>
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}
          {contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
        </div>
      </div>
      <div className="cm-footer-bottom"><p>© {new Date().getFullYear()} {text.footerCopyright}</p><Link href="/privacy">Privacy policy</Link><span>{text.footerNote}</span></div>
    </div></footer>
  );
}

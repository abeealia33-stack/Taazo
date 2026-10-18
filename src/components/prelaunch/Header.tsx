"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homepageLinks, type HomepageText } from "@/lib/homepage-schema";
import { Logo } from "./Logo";
import { LaunchLink } from "./LaunchLink";

export function Header({ text }: { text: HomepageText }) {
  const links = homepageLinks(text);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="cm-header">
      <div className="cm-container cm-header-inner">
        <Link href="/" aria-label="Chulimaar home" onClick={() => setOpen(false)}><Logo variant="horizontal" decorative /></Link>
        <nav className="cm-desktop-nav" aria-label="Main navigation">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <LaunchLink className="cm-button cm-header-cta">{text.launchCta} <span aria-hidden="true">↓</span></LaunchLink>
        <button ref={toggle} type="button" className="cm-menu-toggle" aria-expanded={open} aria-controls="cm-mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}><span aria-hidden="true">{open ? "×" : "☰"}</span></button>
      </div>
      <nav id="cm-mobile-menu" hidden={!open} className="cm-mobile-nav cm-container" aria-label="Mobile navigation">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <LaunchLink className="cm-button" onClick={() => setOpen(false)}>{text.launchCta} <span aria-hidden="true">↓</span></LaunchLink>
      </nav>
    </header>
  );
}

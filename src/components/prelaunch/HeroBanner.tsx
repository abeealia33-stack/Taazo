"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import type { HeroSlide, HeroSlideshow, HomepageText } from "@/lib/homepage-schema";

export function HeroBanner({ hero, text: t, preview }: { hero: HeroSlideshow; text: HomepageText; preview?: "desktop" | "mobile" }) {
  const slides = hero.slides.filter(slide => slide.enabled);
  // The key at the call site resets this local playback state after CMS edits.
  const [active, setActive] = useState(0);
  const [wanted, setWanted] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([0]);
  const ready = useRef(new Set<number>());
  const requested = useRef<number | null>(null);
  const [failed, setFailed] = useState<number[]>([]);
  const [paused, setPaused] = useState(!hero.autoplay || Boolean(preview));
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const next = slides.length ? (active + 1) % slides.length : 0;

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update(); visibility();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => { media.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  const go = useCallback((index: number, manual = false) => {
    if (manual) { setPaused(true); setAnnouncement(`Slide ${index + 1} of ${slides.length}`); }
    if (failed.includes(index)) { if (manual) setAnnouncement("This image could not load. Please choose another slide."); return; }
    setVisited(previous => previous.includes(index) ? previous : [...previous, index]);
    if (ready.current.has(index)) { requested.current = null; setWanted(null); setActive(index); }
    else { requested.current = index; setWanted(index); }
  }, [failed, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused || hovered || focused || hidden || reduced || wanted !== null) return;
    const candidate = slides.findIndex((_, offset) => offset > active && !failed.includes(offset));
    const target = candidate >= 0 ? candidate : slides.findIndex((_, index) => index !== active && !failed.includes(index));
    if (target < 0) return;
    const timer = setTimeout(() => go(target), hero.interval * 1000);
    return () => clearTimeout(timer);
  }, [active, failed, focused, go, hero.interval, hidden, hovered, paused, reduced, slides, wanted]);

  function loaded(index: number) {
    ready.current.add(index);
    if (requested.current === index) { requested.current = null; setWanted(null); setActive(index); }
  }
  function imageError(index: number) {
    setFailed(previous => [...previous, index]);
    if (requested.current === index) { requested.current = null; setWanted(null); setAnnouncement("This image could not load. Please choose another slide."); }
  }
  function imageStyle(slide: HeroSlide): CSSProperties {
    return { "--hero-focus": slide.position, "--hero-mobile-focus": slide.mobilePosition } as CSSProperties;
  }

  return <section className={`cm-hero-banner${preview ? ` cm-hero-preview cm-hero-preview-${preview}` : ""}${slides.length && !failed.includes(active) ? " cm-hero-has-photo" : ""}`} aria-label="Chulimaar introduction" aria-roledescription={slides.length > 1 ? "carousel" : undefined} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="cm-hero-background">
      {slides.map((slide, index) => (visited.includes(index) || index === next) && !failed.includes(index) ? <div key={slide.id} className={`cm-hero-slide${index === active ? " is-active" : ""}`} aria-hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
        <Image src={slide.url} alt={slide.alt} fill sizes={preview ? preview === "mobile" ? "360px" : "900px" : "100vw"} preload={!preview && index === 0} loading={index === 0 && !preview ? undefined : "eager"} fetchPriority={index === 0 ? "high" : "low"} style={imageStyle(slide)} onLoad={() => loaded(index)} onError={() => imageError(index)} />
      </div> : null)}
    </div>
    <div className="cm-hero-shade" />
    <div className="cm-container cm-hero-banner-inner">
      <div className="cm-hero-banner-copy">
        <p className="cm-eyebrow cm-status"><span aria-hidden="true" />{t.heroEyebrow}</p>
        {preview ? <h3 className="cm-hero-title">{t.heroTitle}<br /> <em>{t.heroTitleEm}</em></h3> : <h1 className="cm-hero-title">{t.heroTitle}<br /> <em>{t.heroTitleEm}</em></h1>}
        <p className="cm-lead">{t.heroLead}</p><p className="cm-body">{t.heroBody}</p>
        <div className="cm-actions">{preview ? <><span className="cm-button">{t.launchCta}<ArrowDown size={16} /></span><span className="cm-text-link">{t.founderCta}<ArrowDown size={16} /></span></> : <><a className="cm-button" href="#launch-updates">{t.launchCta}<ArrowDown size={16} aria-hidden="true" /></a><a className="cm-text-link" href="#our-story">{t.founderCta}<ArrowDown size={16} aria-hidden="true" /></a></>}</div>
      </div>
      <div className="cm-hero-bottom">
        {preview ? <span className="cm-hero-scroll">From our roots to your kitchen <ArrowDown size={15} /></span> : <a href="#our-oil" className="cm-hero-scroll">From our roots to your kitchen <ArrowDown size={15} aria-hidden="true" /></a>}
        {slides.length > 1 && <div className="cm-hero-controls" aria-label="Hero slideshow controls">
          <button type="button" aria-label="Previous hero image" onClick={() => go((active + slides.length - 1) % slides.length, true)}><ArrowLeft size={18} /></button>
          <div className="cm-hero-dots">{slides.map((slide, index) => <button type="button" key={slide.id} aria-label={`Show hero image ${index + 1}`} aria-current={index === active ? "true" : undefined} onClick={() => go(index, true)}><span /></button>)}</div>
          <button type="button" aria-label="Next hero image" onClick={() => go(next, true)}><ArrowRight size={18} /></button>
          {!reduced && <button type="button" aria-label={paused ? "Play hero slideshow" : "Pause hero slideshow"} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
        </div>}
      </div>
    </div>
    <span className="sr-only" role="status">{announcement}</span>
  </section>;
}

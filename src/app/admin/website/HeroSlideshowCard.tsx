"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Images, Monitor, Plus, Smartphone, Trash2, Upload, X } from "lucide-react";
import { MAX_HERO_SLIDES, PHOTO_POSITIONS, type HeroSlide, type HeroSlideshow, type HomepageText } from "@/lib/homepage-schema";
import { HeroBanner } from "@/components/prelaunch/HeroBanner";

export type HeroUploadResult = { name: string; ok: boolean; message: string };
export function HeroSlideshowCard({ hero, text, locked, busy, uploadsAvailable, onChange, onUpload }: {
  hero: HeroSlideshow; text: HomepageText; locked: boolean; busy: boolean; uploadsAvailable: boolean;
  onChange: (hero: HeroSlideshow) => void;
  onUpload: (files: File[], replaceId?: string, progress?: (message: string) => void) => Promise<HeroUploadResult[]>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const addInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [results, setResults] = useState<HeroUploadResult[]>([]);
  const [progress, setProgress] = useState("");
  const [dragged, setDragged] = useState<string | null>(null);
  const selected = hero.slides.find(slide => slide.id === selectedId) || hero.slides[0];
  const cover = hero.slides.find(slide => slide.enabled) || hero.slides[0];
  const enabled = hero.slides.filter(slide => slide.enabled).length;

  useEffect(() => {
    const panel = dialog.current;
    if (!open || !panel) return;
    panel.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { panel.close(); document.body.style.overflow = previous; };
  }, [open]);

  function edit(values: Partial<HeroSlide>) { if (selected) onChange({ ...hero, slides: hero.slides.map(slide => slide.id === selected.id ? { ...slide, ...values } : slide) }); }
  function reorder(id: string, target: number) {
    const slides = [...hero.slides];
    const index = slides.findIndex(slide => slide.id === id);
    if (index < 0 || target < 0 || target >= slides.length || index === target) return;
    if (selected) setSelectedId(selected.id);
    slides.splice(target, 0, slides.splice(index, 1)[0]); onChange({ ...hero, slides });
  }
  async function upload(files: File[], replaceId?: string) {
    if (!files.length || locked || !uploadsAvailable) return;
    setResults([]);
    const outcome = await onUpload(files, replaceId, setProgress);
    setResults(outcome);
  }
  const previewHero: HeroSlideshow = { ...hero, autoplay: false, slides: selected ? [{ ...selected, enabled: true }] : [] };

  return <article className="admin-photo-tile">
    <div className="admin-photo-preview">{cover ? <Image src={cover.url} alt={cover.alt || "Hero slideshow preview"} fill unoptimized sizes="350px" style={{ objectFit: "cover", objectPosition: cover.position }} /> : <><Images size={28} strokeWidth={1.4} /><span>Your full-screen introduction</span></>}</div>
    <div className="admin-photo-tile-info"><div className="admin-photo-meta"><span>Hero</span><span className={`admin-status${enabled ? " admin-status-good" : ""}`}>{hero.slides.length} / {MAX_HERO_SLIDES} slides</span></div><h3>Hero slideshow</h3><p>Full-screen photos · desktop & mobile</p><button type="button" className="admin-button admin-button-secondary" disabled={locked} onClick={() => setOpen(true)} aria-haspopup="dialog">Manage slides</button></div>
    <dialog ref={dialog} className="admin-dialog admin-hero-dialog" aria-labelledby="hero-manager-title" onClose={() => setOpen(false)} onCancel={event => { if (locked) event.preventDefault(); }}>
      <div className="admin-dialog-header"><div><h2 id="hero-manager-title">Hero slideshow</h2><p className="admin-description">{enabled} enabled · first enabled image opens the homepage</p></div><button type="button" className="admin-icon-button" aria-label="Close hero slideshow editor" disabled={locked} onClick={() => setOpen(false)}><X size={20} /></button></div>
      <div className="admin-dialog-content">
        <div className="admin-hero-toolbar"><div><h3>Tell your story in photographs</h3><p className="admin-muted">Up to 6 images. Landscape photos around 2200 × 1400px work best.</p></div><button type="button" className="admin-button" disabled={locked || !uploadsAvailable || hero.slides.length >= MAX_HERO_SLIDES} onClick={() => addInput.current?.click()}><Plus size={17} />Add images</button></div>
        <input ref={addInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" hidden aria-label="Choose hero images" disabled={locked || !uploadsAvailable} onChange={event => { void upload(Array.from(event.target.files || [])); event.target.value = ""; }} />
        <input ref={replaceInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden aria-label="Choose replacement hero image" disabled={locked || !uploadsAvailable} onChange={event => { if (selected) void upload(Array.from(event.target.files || []).slice(0, 1), selected.id); event.target.value = ""; }} />
        <div className="admin-hero-drop" role="status" onDragOver={event => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); }} onDrop={event => { event.preventDefault(); if (!locked) void upload(Array.from(event.dataTransfer.files)); }}><Upload size={18} /><span>{busy ? progress || "Uploading your images… Please keep this window open." : "Drop photos here, or use Add images. JPG, PNG, WebP or AVIF · up to 8MB each."}</span></div>
        <div aria-live="polite">{results.map((result, index) => <p key={index} role={result.ok ? "status" : "alert"} className={`admin-notice mt-2 ${result.ok ? "admin-notice-success" : "admin-notice-error"}`}><strong>{result.name}</strong> {result.message}</p>)}</div>
        {!uploadsAvailable && <p className="admin-notice">Image storage is unavailable. Please check the database connection before uploading.</p>}
        {hero.slides.length > 0 && !enabled && <p role="alert" className="admin-notice admin-notice-error mt-3">Enable at least one slide before saving, or remove all slides to use the branded background.</p>}
        <div className="admin-hero-workspace">
          <div className="admin-hero-slides" aria-label="Hero slides in display order">{hero.slides.length ? hero.slides.map((slide, index) => <div key={slide.id} className={`admin-hero-slide-item${selected?.id === slide.id ? " is-selected" : ""}`} draggable={!locked} onDragStart={event => { setDragged(slide.id); event.dataTransfer.setData("text/plain", slide.id); event.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => setDragged(null)} onDragOver={event => { if (dragged && !locked) event.preventDefault(); }} onDrop={event => { if (!dragged || locked) return; event.preventDefault(); event.stopPropagation(); reorder(dragged, index); setDragged(null); }}>
            <button type="button" className="admin-hero-select" disabled={locked} onClick={() => setSelectedId(slide.id)} aria-pressed={selected?.id === slide.id}><span className="admin-hero-thumb"><Image src={slide.url} alt="" fill unoptimized sizes="72px" draggable={false} style={{ objectFit: "cover", objectPosition: slide.position }} /></span><span><strong>Slide {index + 1}</strong><small>{slide.enabled ? hero.slides.find(item => item.enabled)?.id === slide.id ? "Starting image" : "Enabled" : "Hidden"}{!slide.alt.trim() ? " · Description needed" : ""}</small></span></button>
            <div className="admin-hero-order"><button type="button" className="admin-icon-button" disabled={locked || index === 0} aria-label={`Move slide ${index + 1} up`} onClick={() => reorder(slide.id, index - 1)}><ArrowUp size={15} /></button><button type="button" className="admin-icon-button" disabled={locked || index === hero.slides.length - 1} aria-label={`Move slide ${index + 1} down`} onClick={() => reorder(slide.id, index + 1)}><ArrowDown size={15} /></button></div>
          </div>) : <div className="admin-hero-empty"><ImageIcon size={32} strokeWidth={1.3} /><h3>Your story starts here</h3><p>Add your first orchard, kernel, or product photograph.</p></div>}</div>
          <div className="admin-hero-details">{selected ? <fieldset disabled={locked} className="admin-photo-controls"><legend className="sr-only">Selected slide settings</legend><div className="admin-hero-toolbar"><h3>Slide {hero.slides.indexOf(selected) + 1}</h3><label className="admin-hero-toggle"><input type="checkbox" checked={selected.enabled} onChange={event => edit({ enabled: event.target.checked })} />Enabled</label></div>
            <label className="admin-field">Image description (required)<input className="admin-input" value={selected.alt} maxLength={300} placeholder="Describe what is in this photograph" onChange={event => edit({ alt: event.target.value })} aria-invalid={!selected.alt.trim()} /></label>
            <div className="admin-field-grid">{(["position", "mobilePosition"] as const).map(key => <label key={key} className="admin-field">{key === "position" ? "Desktop crop focus" : "Mobile crop focus"}<select className="admin-input" value={selected[key]} onChange={event => edit({ [key]: event.target.value })}>{PHOTO_POSITIONS.map(position => <option key={position} value={position}>{position[0].toUpperCase() + position.slice(1)}</option>)}</select></label>)}</div>
            <div className="flex flex-wrap gap-2"><button type="button" className="admin-button admin-button-secondary" disabled={!uploadsAvailable} onClick={() => replaceInput.current?.click()}><Upload size={16} />Replace image</button><button type="button" className="admin-button admin-button-quiet admin-button-danger" onClick={() => onChange({ ...hero, slides: hero.slides.filter(slide => slide.id !== selected.id) })}><Trash2 size={16} />Remove slide</button></div>
          </fieldset> : <p className="admin-muted">No photographs yet. The live banner will use a warm branded background until you add one.</p>}
          </div>
        </div>
        <fieldset disabled={locked} className="admin-hero-settings"><legend>Slideshow settings</legend><label className="admin-hero-toggle"><input type="checkbox" checked={hero.autoplay} onChange={event => onChange({ ...hero, autoplay: event.target.checked })} />Automatically change photos</label><label className="admin-field">Seconds per image<select value={hero.interval} className="admin-input" onChange={event => onChange({ ...hero, interval: Number(event.target.value) })}>{[4, 5, 6, 7, 8, 9, 10].map(value => <option key={value} value={value}>{value} seconds</option>)}</select></label><p className="admin-muted">Smooth crossfade · visitors can pause · reduced motion is respected.</p></fieldset>
        <div className="admin-hero-toolbar"><div><h3>Draft preview</h3><p className="admin-muted">Selected image with your current headline and buttons. Hidden images are previewed here too.</p></div><div className="admin-hero-preview-switch" role="group" aria-label="Preview screen size"><button type="button" className="admin-icon-button" aria-label="Desktop preview" aria-pressed={mode === "desktop"} onClick={() => setMode("desktop")}><Monitor size={18} /></button><button type="button" className="admin-icon-button" aria-label="Mobile preview" aria-pressed={mode === "mobile"} onClick={() => setMode("mobile")}><Smartphone size={18} /></button></div></div>
        <div className={`admin-hero-preview-frame admin-hero-preview-frame-${mode}`}><HeroBanner key={`${selected?.id}-${selected?.url}-${mode}`} hero={previewHero} text={text} preview={mode} /></div>
      </div>
      <div className="admin-dialog-footer"><p className="admin-muted mr-auto self-center">Draft only. Save changes on the Website page to publish.</p><button type="button" className="admin-button" disabled={locked} onClick={() => setOpen(false)}>Done</button></div>
    </dialog>
  </article>;
}

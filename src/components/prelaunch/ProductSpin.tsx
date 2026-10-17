"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Pause, Play, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-schema";
import { PRODUCT_VIEWS, productDragSteps, wrapProductView } from "@/lib/product-views";

function subscribeMotion(listener: () => void) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ProductSpin({ image, animation, showControls = false }: { image: HomepageContent["images"]["oil"]; animation: boolean; showControls?: boolean }) {
  const id = useId();
  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const zoomViewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; index: number; steps: number; width: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(animation);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string[]>([]);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, () => true);
  const current = PRODUCT_VIEWS[index];
  const ready = PRODUCT_VIEWS.every(view => loaded.includes(view.src) || failed.includes(view.src));
  const autoplay = animation && playing && ready && !reduce && inView && !hidden && !open;

  useEffect(() => {
    const element = stage.current;
    const observer = window.IntersectionObserver ? new IntersectionObserver(entries => setInView(Boolean(entries[0]?.isIntersecting)), { threshold: .15 }) : null;
    if (element) observer?.observe(element);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => setIndex(previous => wrapProductView(previous + 1)), 2100);
    return () => clearInterval(timer);
  }, [autoplay]);

  useEffect(() => {
    const panel = dialog.current;
    if (!open || !panel) return;
    panel.showModal();
    const trigger = opener.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { panel.close(); document.body.style.overflow = previous; trigger?.focus({ preventScroll: true }); };
  }, [open]);

  function select(next: number) { setPlaying(false); setIndex(wrapProductView(next)); }
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !event.isPrimary || (open && zoom > 1)) return;
    setPlaying(false);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, index, steps: 0, width: event.currentTarget.clientWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    if (Math.abs(event.clientY - start.y) > Math.abs(dx) + 12) { endDrag(event); return; }
    const steps = productDragSteps(dx, start.width);
    if (steps !== start.steps) { start.steps = steps; setIndex(wrapProductView(start.index - steps)); }
  }
  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (open && zoom > 1) return; // Arrow keys scroll the enlarged image.
    if (!showControls && animation && !reduce && (event.key === " " || event.key === "Enter")) { event.preventDefault(); setPlaying(previous => !previous); }
    if (event.key === "ArrowLeft") { event.preventDefault(); select(index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); select(index + 1); }
    if (event.key === "Home") { event.preventDefault(); select(0); }
    if (event.key === "End") { event.preventDefault(); select(PRODUCT_VIEWS.length - 1); }
  }
  function changeZoom(next: number) {
    setZoom(next);
    requestAnimationFrame(() => {
      const panel = zoomViewport.current;
      panel?.scrollTo({ left: next === 1 ? 0 : (panel.scrollWidth - panel.clientWidth) / 2, top: 0 });
    });
  }
  function frames(viewer = false) {
    return <div className="cm-spin-frames" data-transition={animation && !reduce ? "on" : "off"}>{PRODUCT_VIEWS.map((view, position) => <div key={view.id} className="cm-spin-frame" data-active={index === position ? "yes" : "no"} aria-hidden={index !== position}>
      {failed.includes(view.src) ? <p className="cm-spin-error">This view could not load. Choose another angle.</p> : <Image src={view.src} alt={position === 0 ? `${image.alt} — front view` : `Chulimaar apricot kernel oil bottle — ${view.label.toLowerCase()} view`} fill sizes={viewer ? "100vw" : "(max-width: 760px) calc(100vw - 40px), 460px"} quality={90} unoptimized={viewer} loading={viewer || inView ? "eager" : "lazy"} draggable={false} style={{ objectFit: "contain" }} onLoad={() => setLoaded(previous => previous.includes(view.src) ? previous : [...previous, view.src])} onError={() => setFailed(previous => previous.includes(view.src) ? previous : [...previous, view.src])} />}
    </div>)}</div>;
  }
  function controls(viewer = false) {
    return <div className="cm-spin-controls"><div className="cm-product-motion-controls" role="group" aria-label={viewer ? "Detailed bottle rotation controls" : "Bottle rotation controls"}>
      <button type="button" aria-label="Rotate bottle left" onClick={() => select(index - 1)}><ArrowLeft size={18} aria-hidden="true" /></button>
      <button type="button" aria-label="Show front of bottle" onClick={() => select(0)}><RotateCcw size={17} aria-hidden="true" /></button>
      <button type="button" aria-label="Rotate bottle right" onClick={() => select(index + 1)}><ArrowRight size={18} aria-hidden="true" /></button>
      {!viewer && animation && !reduce && <button type="button" aria-label={playing ? "Pause bottle rotation" : "Play bottle rotation"} onClick={() => setPlaying(previous => !previous)}>{playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}{playing ? "Pause" : "Play"}</button>}
    </div><div className="cm-spin-angles" role="group" aria-label={viewer ? "Detailed bottle views" : "Bottle views"}>{PRODUCT_VIEWS.map((view, position) => <button key={view.id} type="button" aria-pressed={index === position} onClick={() => select(position)}>{view.label}</button>)}</div></div>;
  }

  return <div className="cm-product-stage-shell cm-product-spin">
    <figure className="cm-product-figure">
      <div ref={stage} className="cm-product-stage cm-spin-stage" data-motion={animation && (showControls || playing) && !reduce && inView && !hidden && !open ? "on" : "off"} data-playing={autoplay ? "yes" : "no"} tabIndex={0} role="group" aria-label={`Interactive bottle, ${current.label.toLowerCase()} view. Drag left or right, or use arrow keys to rotate.`} aria-describedby={`spin-help-${id}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={keyboard}>
        <div className="cm-product-ground" aria-hidden="true" /><div className="cm-spin-bottle">{frames()}</div>
        {showControls && <span className="cm-spin-badge" aria-hidden="true">{index + 1} / {PRODUCT_VIEWS.length}</span>}
      </div>
      {showControls ? <><div className="cm-product-interaction"><p>Explore the bottle</p>{controls()}<span id={`spin-help-${id}`} className="cm-product-motion-hint">Drag or swipe to rotate · {PRODUCT_VIEWS.length} photograph views</span><span className="cm-spin-current" aria-live={autoplay ? "off" : "polite"} aria-atomic="true">{current.label} view</span></div>
      <figcaption className="cm-product-stage-footer"><span>{image.caption}</span><button ref={opener} type="button" aria-haspopup="dialog" onClick={() => { setPlaying(false); setZoom(1); setOpen(true); }}><Maximize2 size={15} aria-hidden="true" />View bottle details</button></figcaption></> : <span id={`spin-help-${id}`} className="sr-only">Drag or swipe horizontally to rotate. Use Left and Right arrow keys to select a view, Home for the front, and End for the back. Press Space or Enter to pause or resume automatic rotation.</span>}
    </figure>
    {showControls && <dialog ref={dialog} className="cm-product-viewer cm-spin-viewer" aria-labelledby={`spin-title-${id}`} onCancel={event => { event.stopPropagation(); setOpen(false); }} onClose={event => { event.stopPropagation(); setOpen(false); }} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      {open && <><div className="cm-product-viewer-header"><div><h2 id={`spin-title-${id}`}>Explore the bottle</h2><p>{current.label} view · {index + 1} of {PRODUCT_VIEWS.length}</p></div><button type="button" aria-label="Close bottle details" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button></div>
        <div className="cm-product-viewer-tools"><button type="button" aria-label={zoom === 1 ? "Zoom in on bottle" : "Zoom out of bottle"} onClick={() => changeZoom(zoom === 1 ? 2 : 1)}>{zoom === 1 ? <ZoomIn size={17} aria-hidden="true" /> : <ZoomOut size={17} aria-hidden="true" />}{zoom === 1 ? "Zoom in" : "Zoom out"}</button><button type="button" onClick={() => changeZoom(1)}>Fit image</button><span role="status">{zoom === 1 ? "Swipe or use arrows to rotate" : "200% · scroll to explore"}</span></div>
        <div ref={zoomViewport} className="cm-product-viewer-viewport cm-spin-viewport" data-zoomed={zoom > 1 ? "yes" : "no"} tabIndex={0} aria-label="Detailed bottle image" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={keyboard}><div className="cm-product-viewer-canvas" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>{frames(true)}</div></div>
        <div className="cm-spin-viewer-controls">{controls(true)}</div>
      </>}
    </dialog>}
  </div>;
}

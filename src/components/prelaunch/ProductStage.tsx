"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, ImageIcon, Maximize2, Pause, Play, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-schema";
import { hasSuppliedBottleViews } from "@/lib/product-views";
import { ProductSpin } from "./ProductSpin";

export function ProductStage({ image, animation, showControls = false }: { image: HomepageContent["images"]["oil"]; animation: boolean; showControls?: boolean }) {
  return hasSuppliedBottleViews(image.url) ? <ProductSpin image={image} animation={animation} showControls={showControls} /> : <SingleProductStage key={image.url} image={image} animation={animation} showControls={showControls} />;
}

function SingleProductStage({ image, animation, showControls }: { image: HomepageContent["images"]["oil"]; animation: boolean; showControls: boolean }) {
  const id = useId();
  const surface = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const point = useRef({ x: .5, y: .5 });
  const visible = useRef(true);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [viewerFailed, setViewerFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [paused, setPaused] = useState(false);
  const [pose, setPose] = useState(0);
  const moving = animation && !paused;
  const available = Boolean(image.url) && failedUrl !== image.url;

  const reset = useCallback(() => {
    if (frame.current !== null) { cancelAnimationFrame(frame.current); frame.current = null; }
    const node = surface.current;
    if (!node) return;
    for (const property of ["--product-rx", "--product-ry", "--product-light"]) node.style.removeProperty(property);
  }, []);

  useEffect(() => {
    const node = surface.current;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const observer = node && window.IntersectionObserver ? new IntersectionObserver(entries => {
      visible.current = Boolean(entries[0]?.isIntersecting);
      if (node) node.dataset.inView = visible.current ? "yes" : "no";
      if (!visible.current) reset();
    }) : null;
    if (node) observer?.observe(node);
    reset();
    document.addEventListener("visibilitychange", reset);
    motion.addEventListener("change", reset); pointer.addEventListener("change", reset);
    return () => { reset(); observer?.disconnect(); document.removeEventListener("visibilitychange", reset); motion.removeEventListener("change", reset); pointer.removeEventListener("change", reset); };
  }, [moving, reset]);

  useEffect(() => {
    const panel = dialog.current;
    if (!open || !panel) return;
    panel.showModal();
    const opener = trigger.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { panel.close(); document.body.style.overflow = previous; opener?.focus({ preventScroll: true }); };
  }, [open]);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!moving || !available || document.hidden || !visible.current || event.pointerType !== "mouse" || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    point.current = { x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)), y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)) };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const node = surface.current;
      if (!node) return;
      node.style.setProperty("--product-rx", `${(0.5 - point.current.y) * 14}deg`);
      node.style.setProperty("--product-ry", `${(point.current.x - 0.5) * 24}deg`);
      node.style.setProperty("--product-x", `${point.current.x * 100}%`);
      node.style.setProperty("--product-y", `${point.current.y * 100}%`);
      node.style.setProperty("--product-light", "1");
    });
  }
  function tilt(next: number) { reset(); setPose(next); }
  function changeZoom(next: number) {
    setZoom(next);
    requestAnimationFrame(() => {
      const panel = viewport.current;
      panel?.scrollTo({ left: next === 1 ? 0 : (panel.scrollWidth - panel.clientWidth) / 2, top: 0 });
    });
  }

  return <div className="cm-product-stage-shell">
    <figure className="cm-product-figure">
      <div ref={surface} className="cm-product-stage" data-motion={moving ? "on" : "off"} data-pose={pose} tabIndex={animation ? 0 : undefined} aria-label="Product photograph. Press Space to pause or resume animation." onKeyDown={event => { if (animation && event.key === " ") { event.preventDefault(); reset(); setPaused(previous => !previous); } }} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
        {available ? <><div className="cm-product-ground" aria-hidden="true" /><div className="cm-product-pose"><div className="cm-product-float"><Image key={image.url} src={image.url} alt={image.alt} fill sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) 42vw, 460px" quality={90} unoptimized={image.url.startsWith("https://")} style={{ objectFit: "contain", objectPosition: image.position }} onError={() => setFailedUrl(image.url)} /></div></div></> : <div className="cm-product-empty"><ImageIcon size={40} strokeWidth={1.2} aria-hidden="true" /><span>{image.url ? "This photograph could not load." : "Product photograph coming soon"}</span><p>Our first product, taking shape.</p></div>}
      </div>
      {showControls && animation && available && <div className="cm-product-interaction"><p>Bring the bottle to life</p><div className="cm-product-motion-controls" role="group" aria-label="Bottle animation controls"><button type="button" aria-label="Tilt bottle left" aria-pressed={pose === -1} disabled={paused} onClick={() => tilt(-1)}><ArrowLeft size={18} aria-hidden="true" /></button><button type="button" aria-label="Reset bottle position" disabled={paused} onClick={() => tilt(0)}><RotateCcw size={17} aria-hidden="true" /></button><button type="button" aria-label="Tilt bottle right" aria-pressed={pose === 1} disabled={paused} onClick={() => tilt(1)}><ArrowRight size={18} aria-hidden="true" /></button><button type="button" aria-label={paused ? "Resume bottle animation" : "Pause bottle animation"} onClick={() => { reset(); setPaused(!paused); }}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}{paused ? "Play" : "Pause"}</button></div><span className="cm-product-motion-hint" role="status">{paused ? "Animation paused" : pose === -1 ? "Tilted left · tap reset to float" : pose === 1 ? "Tilted right · tap reset to float" : "Move your mouse or tap the arrows"}</span></div>}
      {showControls && <figcaption className="cm-product-stage-footer"><span>{image.caption}</span><button ref={trigger} type="button" disabled={!available} onClick={() => { reset(); setZoom(1); setViewerFailed(false); setOpen(true); }} aria-haspopup="dialog"><Maximize2 size={15} aria-hidden="true" />View bottle details</button></figcaption>}
    </figure>
    {showControls && <dialog ref={dialog} className="cm-product-viewer" aria-labelledby={`product-viewer-title-${id}`} onCancel={event => { event.stopPropagation(); setOpen(false); }} onClose={event => { event.stopPropagation(); setOpen(false); }} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      {open && <><div className="cm-product-viewer-header"><div><h2 id={`product-viewer-title-${id}`}>Bottle details</h2><p>{image.caption || "Chulimaar apricot kernel oil"}</p></div><button type="button" aria-label="Close bottle details" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button></div>
        <div className="cm-product-viewer-tools"><button type="button" aria-label={zoom === 1 ? "Zoom in on bottle" : "Zoom out of bottle"} onClick={() => changeZoom(zoom === 1 ? 2 : 1)}>{zoom === 1 ? <ZoomIn size={17} aria-hidden="true" /> : <ZoomOut size={17} aria-hidden="true" />}{zoom === 1 ? "Zoom in" : "Zoom out"}</button><button type="button" onClick={() => changeZoom(1)}><Maximize2 size={16} aria-hidden="true" />Fit image</button><span role="status">{zoom === 1 ? "Full bottle" : "200% · scroll to explore"}</span></div>
        <div ref={viewport} className="cm-product-viewer-viewport" tabIndex={0} aria-label="Bottle image. Scroll to inspect when zoomed.">{viewerFailed ? <p role="alert" className="cm-product-viewer-error">The detailed image could not load. Please close this view and try again.</p> : <div className="cm-product-viewer-canvas" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}><Image src={image.url} alt={image.alt} fill sizes="100vw" unoptimized loading="eager" style={{ objectFit: "contain" }} onError={() => setViewerFailed(true)} /></div>}</div>
      </>}
    </dialog>}
  </div>;
}

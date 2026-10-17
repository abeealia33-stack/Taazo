"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { DEFAULT_PRODUCT_IMAGE, PHOTO_POSITIONS, type HomepageContent, type HomepageText, type PHOTO_FIELDS, type PhotoKey } from "@/lib/homepage-schema";
import { ProductShowcase } from "@/components/prelaunch/ProductShowcase";

export function PhotoUploadCard({ photo, image, uploading, disabled, uploadsAvailable, notice, onOpen, onEdit, onUpload, product }: {
  photo: typeof PHOTO_FIELDS[number]; image: HomepageContent["images"][PhotoKey];
  uploading: PhotoKey | null; disabled: boolean; uploadsAvailable: boolean;
  notice: { ok: boolean; message: string } | null; onOpen: () => void;
  onEdit: (key: PhotoKey, values: Partial<HomepageContent["images"][PhotoKey]>) => void;
  onUpload: (key: PhotoKey, file: File) => Promise<void>;
  product?: { animation: boolean; text: HomepageText; onAnimation: (enabled: boolean) => void };
}) {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const busy = uploading === photo.key;
  const locked = disabled || Boolean(uploading);

  useEffect(() => {
    const panel = dialog.current;
    if (!open || !panel) return;
    panel.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { panel.close(); document.body.style.overflow = previous; };
  }, [open]);

  return <article className={`admin-photo-tile${photo.key === "oil" ? " admin-photo-tile-product" : ""}`}>
    <div className="admin-photo-preview">
      {image.url ? <Image src={image.url} alt={image.alt || `${photo.label} preview`} fill unoptimized sizes="(max-width: 760px) 45vw, 350px" style={{ objectFit: photo.key === "oil" ? "contain" : "cover", objectPosition: image.position }} /> : <><ImageIcon size={24} strokeWidth={1.4} aria-hidden="true" /><span>Photo coming soon</span></>}
    </div>
    <div className="admin-photo-tile-info">
      <div className="admin-photo-meta"><span>{photo.section}</span><span className={`admin-status${image.url ? " admin-status-good" : ""}`}>{image.url ? "Added" : "Empty"}</span></div>
      <h3>{photo.label}</h3><p>{photo.size}</p>
      <button type="button" className="admin-button admin-button-secondary" disabled={locked} onClick={() => { onOpen(); setOpen(true); }} aria-haspopup="dialog" aria-label={`Manage ${photo.label.toLowerCase()}`}>Manage photo</button>
    </div>
    <dialog ref={dialog} aria-labelledby={`photo-title-${photo.key}`} aria-describedby={`photo-help-${photo.key}`} className="admin-dialog" onClose={() => setOpen(false)} onCancel={event => { if (locked) event.preventDefault(); }} onClick={event => { if (event.target === event.currentTarget && !locked) setOpen(false); }}>
      <div className="admin-dialog-header"><div><h2 id={`photo-title-${photo.key}`}>{photo.label}</h2><p className="admin-description">{photo.section} section</p></div><button type="button" className="admin-icon-button" aria-label={`Close ${photo.label.toLowerCase()} editor`} onClick={() => setOpen(false)} disabled={locked}><X size={20} aria-hidden="true" /></button></div>
      <div className="admin-dialog-content">
        {notice && <p role={notice.ok ? "status" : "alert"} className={`admin-notice mb-5 ${notice.ok ? "admin-notice-success" : "admin-notice-error"}`}>{notice.message}</p>}
        <p id={`photo-help-${photo.key}`} className="admin-muted mb-5">{photo.guidance}</p>
        <div className="admin-photo-edit-grid">
          <div><div style={{ aspectRatio: photo.ratio, ...(photo.key === "oil" ? { background: "#f7f2e7" } : {}) }} className="admin-photo-edit-preview">{image.url ? <Image src={image.url} alt={image.alt || `${photo.label} preview`} fill unoptimized sizes="260px" style={{ objectFit: photo.key === "oil" ? "contain" : "cover", objectPosition: image.position }} /> : <ImageIcon size={36} strokeWidth={1.3} aria-hidden="true" />}</div><p className="admin-muted mt-3">Suggested: {photo.size}</p></div>
          <div className="admin-photo-controls">
            <div className="flex flex-wrap items-center gap-2">
              <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label={`Choose image for ${photo.label}`} hidden disabled={locked || !uploadsAvailable} onChange={event => { const file = event.target.files?.[0]; if (file) void onUpload(photo.key, file); event.target.value = ""; }} />
              <button type="button" className="admin-button" disabled={locked || !uploadsAvailable} onClick={() => input.current?.click()} aria-label={`${image.url ? "Replace" : "Upload"} image for ${photo.label}`}><Upload size={16} aria-hidden="true" />{busy ? "Uploading…" : image.url ? "Replace image" : "Upload image"}</button>
              {image.url && <button type="button" className="admin-button admin-button-quiet admin-button-danger" disabled={locked} onClick={() => onEdit(photo.key, { url: "" })}>Remove image</button>}
            </div>
            <p className="admin-muted">{uploadsAvailable ? "JPG, PNG, WebP or AVIF · up to 8MB." : "Photo uploads are being set up. Your existing images and placeholders are still available."}</p>
            <label className="admin-field">Image description (alt text)<input value={image.alt} maxLength={300} disabled={locked} onChange={event => onEdit(photo.key, { alt: event.target.value })} className="admin-input" /></label>
            <label className="admin-field">Photo caption<input value={image.caption} maxLength={160} disabled={locked} onChange={event => onEdit(photo.key, { caption: event.target.value })} className="admin-input" /></label>
            <label className="admin-field">{photo.key === "oil" ? "Image alignment (full photograph stays visible)" : "Crop focus"}<select value={image.position} disabled={locked} onChange={event => onEdit(photo.key, { position: event.target.value as HomepageContent["images"][PhotoKey]["position"] })} className="admin-input">{PHOTO_POSITIONS.map(position => <option key={position} value={position}>{position[0].toUpperCase() + position.slice(1)}</option>)}</select></label>
            {product && <><label className="admin-product-animation"><input type="checkbox" checked={product.animation} disabled={locked} onChange={event => product.onAnimation(event.target.checked)} />Enable product animation</label><p className="admin-muted">The supplied bottle includes four photograph views: drag, swipe or select an angle. This setting controls automatic rotation and decorative motion; manual views remain available. Custom uploads use the single-photo presentation.</p><button type="button" className="admin-button admin-button-secondary" disabled={locked} onClick={() => onEdit("oil", { url: DEFAULT_PRODUCT_IMAGE, alt: photo.alt })}>Use supplied bottle image</button></>}
          </div>
        </div>
        {product && <><h3 className="admin-product-preview-heading">Interactive draft preview</h3><p className="admin-muted mb-4">Try the product details and image viewer. Save changes on the Website page to publish.</p><ProductShowcase key={image.url} image={image} text={product.text} animation={product.animation} preview /></>}
      </div>
      <div className="admin-dialog-footer"><p className="admin-muted mr-auto self-center">Save changes on the Website page to publish.</p><button type="button" className="admin-button admin-button-secondary" disabled={locked} onClick={() => setOpen(false)}>Done</button></div>
    </dialog>
  </article>;
}

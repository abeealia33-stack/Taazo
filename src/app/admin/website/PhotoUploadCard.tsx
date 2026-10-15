"use client";

import Image from "next/image";
import { useRef } from "react";
import { PHOTO_POSITIONS, type HomepageContent, type PHOTO_FIELDS, type PhotoKey } from "@/lib/homepage-schema";

const fieldClass = "w-full min-h-11 rounded-md border border-sand-300 bg-cream px-3 py-2 text-base text-charcoal outline-offset-2 focus:outline-2 focus:outline-terracotta";

export function PhotoUploadCard({ photo, image, uploading, disabled, onEdit, onUpload }: {
  photo: typeof PHOTO_FIELDS[number]; image: HomepageContent["images"][PhotoKey];
  uploading: PhotoKey | null; disabled: boolean;
  onEdit: (key: PhotoKey, values: Partial<HomepageContent["images"][PhotoKey]>) => void;
  onUpload: (key: PhotoKey, file: File) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const busy = uploading === photo.key;
  return <section aria-labelledby={`photo-title-${photo.key}`} className="mb-6 rounded-xl border border-sand-300 bg-sand-50 p-4 sm:p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 id={`photo-title-${photo.key}`} className="text-lg font-medium text-charcoal">{photo.label}</h2><span className="rounded-full bg-sand-200 px-3 py-1 text-xs text-sand-800">{photo.section} section</span></div>
    <div className="grid items-start gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
      <div>
        <div style={{ aspectRatio: photo.ratio }} className={`relative flex w-full max-w-[260px] flex-col items-center justify-center overflow-hidden rounded-lg ${image.url ? "bg-sand-200" : "border-2 border-dashed border-sand-400 bg-cream px-4 text-center"}`}>
          {image.url ? <Image src={image.url} alt={image.alt || `${photo.label} preview`} fill unoptimized sizes="(max-width: 639px) 260px, 180px" style={{ objectFit: "cover", objectPosition: image.position }} /> : <>
            <svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-sand-600" aria-hidden="true"><rect x="5" y="8" width="38" height="32" rx="4" /><circle cx="16" cy="18" r="4" /><path d="m7 36 12-11 8 7 7-6 8 10" /></svg>
            <span className="text-sm font-medium text-sand-800">{photo.label}</span><span className="mt-1 text-xs text-sand-600">No image added yet</span>
          </>}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-sand-700">Suggested: {photo.size}</p>
      </div>
      <div className="grid min-w-0 gap-4">
        <p className="text-sm leading-relaxed text-sand-700">{photo.guidance}</p>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label={`Choose image for ${photo.label}`} hidden disabled={disabled || Boolean(uploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUpload(photo.key, file); event.target.value = ""; }} />
          <button type="button" onClick={() => input.current?.click()} aria-label={`${image.url ? "Replace" : "Upload"} image for ${photo.label}`} disabled={disabled || Boolean(uploading)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-charcoal px-5 py-2 text-sm text-cream hover:bg-sand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta disabled:cursor-wait disabled:opacity-60"><span aria-hidden="true">↑</span>{busy ? "Uploading…" : image.url ? "Replace image" : "Upload image"}</button>
          {image.url && <button type="button" disabled={disabled || Boolean(uploading)} className="min-h-11 px-1 text-sm text-terracotta-deep underline disabled:opacity-60" aria-label={`Remove image for ${photo.label}`} onClick={() => onEdit(photo.key, { url: "" })}>Remove image</button>}
        </div>
        <p className="text-xs leading-relaxed text-sand-600">JPG, PNG, WebP or AVIF · up to 8MB. Upload, then choose Save changes to publish.</p>
        <label className="grid gap-2 text-sm text-sand-800">Image description (alt text)<input value={image.alt} maxLength={300} onChange={(event) => onEdit(photo.key, { alt: event.target.value })} className={fieldClass} /></label>
        <label className="grid gap-2 text-sm text-sand-800">Photo caption<input value={image.caption} maxLength={160} onChange={(event) => onEdit(photo.key, { caption: event.target.value })} className={fieldClass} /></label>
        <label className="grid gap-2 text-sm text-sand-800">Crop focus<select value={image.position} onChange={(event) => onEdit(photo.key, { position: event.target.value as HomepageContent["images"][PhotoKey]["position"] })} className={fieldClass}>{PHOTO_POSITIONS.map((position) => <option key={position} value={position}>{position}</option>)}</select></label>
      </div>
    </div>
  </section>;
}

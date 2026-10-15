import Image from "next/image";

export function MediaPanel({ photo, alt, label, placeholderLabel, kind = "landscape", priority = false, position = "center" }: {
  photo: string | null; alt: string; label: string; placeholderLabel: string;
  kind?: "landscape" | "portrait" | "hero"; priority?: boolean; position?: string;
}) {
  return (
    <figure className={`cm-media cm-media-${kind}`}>
      {photo ? <Image src={photo} alt={alt} fill sizes="(max-width: 760px) calc(100vw - 40px), 50vw" preload={priority} unoptimized={photo.startsWith("https://")} style={{ objectPosition: position }} className="cm-photo" /> : (
        <div className="cm-media-empty">
          <svg className="cm-placeholder-icon" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
            <rect x="5" y="8" width="38" height="32" rx="3" />
            <circle cx="17" cy="19" r="4" />
            <path d="m6 35 12-10 9 7 7-6 8 9" />
          </svg>
          <span className="cm-eyebrow">Photo coming soon</span>
          <p className="cm-media-title">{placeholderLabel}</p>
        </div>
      )}
      {photo && label && <figcaption className="cm-photo-caption">{label}</figcaption>}
    </figure>
  );
}

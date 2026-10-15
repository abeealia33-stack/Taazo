import Image from "next/image";

/** Replace CHULIMAAR_HERO_PHOTO with an approved, authentic local photograph. */
export const HERO_ILLUSTRATION = "/chulimaar/apricot-study.svg";

export function MediaPanel({ photo, alt, label, caption, kind = "landscape", priority = false, position = "center" }: {
  photo: string | null; alt: string; label: string; caption: string;
  kind?: "landscape" | "portrait" | "hero"; priority?: boolean; position?: string;
}) {
  return (
    <figure className={`cm-media cm-media-${kind}`}>
      {photo || kind === "hero" ? <><Image src={photo || HERO_ILLUSTRATION} alt={photo ? alt : "Illustrated study of apricots, leaves and kernels"} fill sizes="(max-width: 760px) calc(100vw - 40px), 50vw" preload={priority} unoptimized={Boolean(photo?.startsWith("https://"))} style={{ objectPosition: position }} className="cm-photo" />{!photo && <figcaption className="cm-photo-caption">Apricot study · Illustration</figcaption>}</> : (
        <div className="cm-media-empty">
          <span className="cm-eyebrow">{label}</span>
          <span className="cm-media-rule" aria-hidden="true" />
          <p className="cm-media-caption">{caption}</p>
        </div>
      )}
      {photo && label && <figcaption className="cm-photo-caption">{label}</figcaption>}
    </figure>
  );
}

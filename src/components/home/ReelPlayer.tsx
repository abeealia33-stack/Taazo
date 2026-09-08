"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicReel } from "@/lib/media";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A single reel.
 *
 * Plays muted while it is on screen and pauses the moment it leaves, so a rail
 * of a dozen videos never has more than the visible ones decoding. Under
 * reduced motion nothing autoplays at all — the poster stands in until the
 * viewer presses play.
 *
 * Sound is off by default (browsers require it for autoplay) with a control to
 * turn it on, because these are cooking videos and the sound is half of it.
 */
export function ReelPlayer({ reel }: { reel: PublicReel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().then(
            () => setPlaying(true),
            () => setPlaying(false),
          );
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.55 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <figure className="group relative overflow-hidden rounded-xl bg-charcoal shadow-md">
      <div className="relative aspect-9/16">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl ?? undefined}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onClick={toggle}
          className="h-full w-full cursor-pointer object-cover"
        />

        {/* Legibility scrim for the caption. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(to top, rgba(43,33,23,0.85) 0%, transparent 100%)",
          }}
        />

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-charcoal/60 text-cream backdrop-blur-sm transition-colors hover:bg-charcoal/85"
        >
          {muted ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path
                d="m16 9 5 6m0-6-5 6"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path
                d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7 7 0 0 1 0 11"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </button>

        {!playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Play video"
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-cream/90 text-charcoal shadow-lg transition-transform duration-[var(--dur-fast)] group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}

        {(reel.title || reel.caption) && (
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            {reel.title && (
              <p className="text-sm font-medium text-cream">{reel.title}</p>
            )}
            {reel.caption && (
              <p className="mt-0.5 line-clamp-2 text-xs text-cream/75">
                {reel.caption}
              </p>
            )}
          </figcaption>
        )}
      </div>

      {reel.externalUrl && (
        <a
          href={reel.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-3 top-3 rounded-full bg-charcoal/60 px-3 py-1.5 text-2xs uppercase tracking-[0.1em] text-cream backdrop-blur-sm transition-colors hover:bg-charcoal/85"
        >
          watch on instagram
        </a>
      )}
    </figure>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductImage } from "./ProductImage";

/**
 * The product page's image column.
 *
 * Every uploaded photo is shown, not just the first — a second angle is often
 * the one that sells a gift box. Falls back to the designed placeholder when
 * a product has no photography yet.
 */
export function ProductGallery({
  photos,
  name,
  accent,
}: {
  photos: string[];
  name: string;
  accent: string;
}) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <ProductImage
        photo={null}
        name={name}
        accent={accent}
        ratio="product"
        className="rounded-2xl shadow-lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-sand-200 shadow-lg">
        {/*
          All photos are rendered and cross-faded rather than swapping one src.
          Switching src re-requests and flashes; this way every angle is decoded
          once and the change is instant.
        */}
        {photos.map((url, i) => (
          <Image
            key={url}
            src={url}
            alt={i === 0 ? name : `${name}, view ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 48vw"
            quality={95}
            className={cn(
              "object-cover transition-opacity duration-[var(--dur-base)] ease-(--ease-out-soft)",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      {photos.length > 1 && (
        <ul className="flex flex-wrap gap-2.5">
          {photos.map((url, i) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-label={`Show view ${i + 1} of ${photos.length}`}
                aria-pressed={i === active}
                className={cn(
                  "relative h-20 w-20 overflow-hidden rounded-lg bg-sand-200 transition-all duration-[var(--dur-fast)]",
                  i === active
                    ? "ring-2 ring-terracotta ring-offset-2 ring-offset-cream"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={url}
                  alt=""
                  aria-hidden
                  fill
                  sizes="80px"
                  quality={90}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

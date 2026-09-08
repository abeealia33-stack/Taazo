import { ImageResponse } from "next/og";

/**
 * Favicon, generated from the brand rather than shipped as a stale .ico.
 *
 * Drawn with plain elements because the image renderer does not run our CSS —
 * a terracotta rounded square carrying the wordmark's "t" and its full stop,
 * which is the monogram from Wordmark.tsx.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#C4602F",
          borderRadius: 8,
          position: "relative",
        }}
      >
        {/* stem of the t */}
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 6,
            width: 3,
            height: 17,
            background: "#F6EFE3",
            borderRadius: 2,
          }}
        />
        {/* crossbar */}
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 12,
            width: 12,
            height: 3,
            background: "#F6EFE3",
            borderRadius: 2,
          }}
        />
        {/* the full stop — the brand's signature */}
        <div
          style={{
            position: "absolute",
            left: 21,
            top: 20,
            width: 4,
            height: 4,
            background: "#F6EFE3",
            borderRadius: 4,
          }}
        />
      </div>
    ),
    size,
  );
}

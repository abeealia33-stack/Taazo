import { ImageResponse } from "next/og";

/** Home-screen icon. Same monogram, scaled for 180px. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#C4602F",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 74, top: 34, width: 16, height: 96, background: "#F6EFE3", borderRadius: 10 }} />
        <div style={{ position: "absolute", left: 46, top: 68, width: 66, height: 16, background: "#F6EFE3", borderRadius: 10 }} />
        <div style={{ position: "absolute", left: 118, top: 114, width: 22, height: 22, background: "#F6EFE3", borderRadius: 22 }} />
      </div>
    ),
    size,
  );
}

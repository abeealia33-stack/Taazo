import { ImageResponse } from "next/og";

/**
 * The card people see when the site is shared on WhatsApp, Instagram or
 * Facebook — which, for this brand, is where most first impressions happen.
 * Without it a share shows a bare grey box.
 */
export const alt = "taazo. — pressed this morning, bottled by noon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(150deg, #2F3A22 0%, #2B2117 55%, #C4602F 140%)",
          color: "#F6EFE3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", position: "relative", width: 44, height: 44 }}>
            <div style={{ position: "absolute", left: 18, top: 6, width: 5, height: 28, background: "#C4602F", borderRadius: 3 }} />
            <div style={{ position: "absolute", left: 10, top: 16, width: 20, height: 5, background: "#C4602F", borderRadius: 3 }} />
            <div style={{ position: "absolute", left: 33, top: 30, width: 7, height: 7, background: "#C4602F", borderRadius: 7 }} />
          </div>
          <div style={{ fontSize: 24, letterSpacing: 6, opacity: 0.7 }}>
            LAHORE · COLD-PRESSED
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, lineHeight: 1.02, letterSpacing: -3 }}>
            Pressed this morning.
          </div>
          <div style={{ fontSize: 92, lineHeight: 1.02, letterSpacing: -3, color: "#D9A441" }}>
            Bottled by noon.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, opacity: 0.75 }}>
            Fresh juice, fruit jars and iced tea — delivered the same day.
          </div>
        </div>
      </div>
    ),
    size,
  );
}

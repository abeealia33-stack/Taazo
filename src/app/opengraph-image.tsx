import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BRAND_COLORS } from "@/lib/brand-system";
import headlineOutline from "@/data/chulimaar-share-headline.json";

export const alt = "Chulimaar — Rooted in Skardu. Pressed in Skardu. Preparing our first batch.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [logo, headline] = await Promise.all([
    readFile(join(process.cwd(), "public/chulimaar/brand/stacked-reversed.png")),
    readFile(join(process.cwd(), "public/chulimaar/brand/share-headline.png")),
  ]);
  const headlineHeight = Math.round(740 * (headlineOutline.bounds.height + 32) / (headlineOutline.bounds.width + 32));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: BRAND_COLORS.page, color: BRAND_COLORS.brown }}>
      <div style={{ width: 360, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND_COLORS.brown }}>
        {/* ImageResponse supports native image elements rather than next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="Chulimaar" width={320} height={280} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px 50px", width: 840 }}>
        <div style={{ fontSize: 22, letterSpacing: 3 }}>PREPARING OUR FIRST BATCH</div>
        {/* The outlined Georgia headline matches the website's display family. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${headline.toString("base64")}`} alt="Rooted in Skardu. Pressed in Skardu." width={740} height={headlineHeight} />
        <div style={{ fontSize: 27 }}>Apricot kernel oil for your kitchen.</div>
      </div>
    </div>,
    size,
  );
}

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { artwork, wordmark, logoLayout, artworkFill, BRAND_COLORS, type LogoVariant, type LogoTone } from "../src/lib/brand-system";
import headline from "../src/data/chulimaar-share-headline.json";

function logoSvg(variant: LogoVariant, tone: LogoTone, monoColor = BRAND_COLORS.brown as string) {
  const layout = logoLayout(variant);
  const symbol = artwork.filter((path) => variant === "stacked" || path.part === "symbol").map((path) => `<path d="${path.d}" transform="${path.transform}" fill="${artworkFill(path.role, tone)}"/>`).join("");
  const lettering = variant === "icon" ? "" : `<g transform="${layout.wordmarkTransform}">${wordmark.paths.map((path) => `<path d="${path.d}" fill="${tone === "mono" ? "currentColor" : path.period ? BRAND_COLORS.orange : tone === "reversed" ? BRAND_COLORS.cream : BRAND_COLORS.brown}"/>`).join("")}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" color="${monoColor}" role="img" aria-label="Chulimaar"><g transform="${layout.artworkTransform}">${symbol}</g>${lettering}</svg>`;
}

async function main() {
  const folder = join(process.cwd(), "public/chulimaar/brand");
  await mkdir(folder, { recursive: true });
  for (const variant of ["horizontal", "stacked", "icon"] as const) {
    for (const tone of ["color", "reversed", "mono"] as const) {
      const svg = logoSvg(variant, tone);
      await writeFile(join(folder, `${variant}-${tone === "mono" ? "mono-brown" : tone}.svg`), svg);
      if (tone === "mono") await writeFile(join(folder, `${variant}-mono-cream.svg`), logoSvg(variant, tone, BRAND_COLORS.cream));
      if (variant === "stacked" && tone !== "mono") {
        await sharp(Buffer.from(svg)).resize(640, 560).png().toFile(join(folder, `${variant}-${tone}.png`));
      }
    }
  }
  const symbol = logoSvg("icon", "color");
  const headlineSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${headline.bounds.width + 32}" height="${headline.bounds.height + 32}" viewBox="0 0 ${headline.bounds.width + 32} ${headline.bounds.height + 32}"><path d="${headline.d}" transform="translate(${16 - headline.bounds.x} ${16 - headline.bounds.y})" fill="${BRAND_COLORS.brown}"/></svg>`;
  await sharp(Buffer.from(headlineSvg)).resize(740).png().toFile(join(folder, "share-headline.png"));
  // Use the apricot symbol alone, with a transparent background.
  await writeFile("src/app/icon.svg", symbol);
  await sharp(Buffer.from(symbol)).resize(16, 16).png().toFile(join(folder, "favicon-16.png"));
  await sharp(Buffer.from(symbol)).resize(32, 32).png().toFile(join(folder, "favicon-32.png"));
  await sharp(Buffer.from(symbol)).resize(180, 180).flatten({ background: BRAND_COLORS.cream }).png().toFile("src/app/apple-icon.png");
  const profileLogo = await sharp(Buffer.from(logoSvg("stacked", "color"))).resize(660, 578).png().toBuffer();
  await sharp({ create: { width: 1000, height: 1000, channels: 4, background: BRAND_COLORS.cream } }).composite([{ input: profileLogo, gravity: "centre" }]).png().toFile(join(folder, "social-profile.png"));
  const cards: string[] = [];
  const tones = ["color", "reversed", "mono"] as const;
  for (const [column, variant] of (["horizontal", "stacked", "icon"] as const).entries()) {
    for (const [row, tone] of tones.entries()) {
      const svg = logoSvg(variant, tone);
      const x = column * 440;
      const y = row * 320;
      const background = tone === "reversed" ? BRAND_COLORS.brown : BRAND_COLORS.cream;
      const label = tone === "reversed" ? BRAND_COLORS.cream : BRAND_COLORS.brown;
      cards.push(`<rect x="${x}" y="${y}" width="440" height="320" fill="${background}"/><text x="${x + 22}" y="${y + 30}" fill="${label}" font-family="sans-serif" font-size="14">${variant} / ${tone}</text><svg x="${x + 60}" y="${y + 50}" width="320" height="245" color="${BRAND_COLORS.brown}" viewBox="0 0 ${logoLayout(variant).width} ${logoLayout(variant).height}">${svg.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`);
    }
  }
  await mkdir("docs/previews", { recursive: true });
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="960">${cards.join("")}</svg>`)).png().toFile("docs/previews/chulimaar-logo-system.png");
  console.log("Generated horizontal, stacked and icon assets in four approved colour treatments, plus social and app icons.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

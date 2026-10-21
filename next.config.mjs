/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isolated browser/integration QA must not overwrite the normal dev build.
  distDir: process.env.CHULIMAAR_CMS_QA === "1" ? ".tmp/cms-next" : ".next",
  async redirects() {
    return [
      { source: "/guides/apricot-oil-uses", destination: "/guides/apricot-oil-skin-hair", permanent: true },
      { source: "/guides/apricot-oil-benefits", destination: "/guides/apricot-kernel-oil-unsaturated-fats", permanent: true },
    ];
  },
  async headers() {
    return process.env.CHULIMAAR_SEARCH_INDEXING === "false"
      ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
      : [];
  },
  experimental: {
    /**
     * Server Actions cap request bodies at 1MB by default. Media no longer
     * travels this path — every upload goes through the route handler at
     * /api/admin/upload, which streams the body with no cap — but this is kept
     * raised so a form that happens to carry a file (the payment-proof upload
     * at checkout) is not silently rejected.
     */
    serverActions: { bodySizeLimit: "32mb" },
  },

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.public.blob.vercel-storage.com", pathname: "/**" }],
    /**
     * AVIF first, WebP as the fallback.
     *
     * AVIF holds detail far better than WebP at the same file size, which
     * matters here specifically: the photography is close-up fruit — fine
     * texture, dense colour, wet highlights — exactly the content that shows
     * compression artefacts first. The browser picks whichever it supports.
     */
    formats: ["image/avif", "image/webp"],

    /**
     * Next re-encodes every image it serves, and the default quality is 75.
     * On flat UI that is invisible; on a full-bleed photograph of cut fruit it
     * is not — you get mushy edges on the seeds and banding in the juice.
     *
     * Since Next 15.4 any quality value used in the app must be listed here,
     * so this is the allowlist, not just a default:
     *   90 — product cards and detail shots
     *   95 — the hero, which is displayed at full viewport width
     * The uploaded original is never touched; this only governs the derivative
     * that gets served.
     */
    qualities: [75, 90, 95],

    /**
     * Widths Next will generate. The defaults stop being generous around the
     * hero: on a 4K monitor a 100vw image would otherwise be upscaled from
     * 3840 or served larger than needed on smaller screens.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],

    /** Optimised derivatives are immutable — cache them for a year. */
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;

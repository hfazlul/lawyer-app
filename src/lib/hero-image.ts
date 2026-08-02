/** Higher-resolution source for full-width hero banners. */
export const HERO_SLIDE_IMAGE_SPECS = {
  width: 1920,
  height: 900,
  hint:
    "Recommended: 1920 × 900 px (landscape). On mobile the slider uses this aspect ratio at full width; on larger screens it fills 50–75vh with object-cover — keep the main subject near the center.",
} as const

export function getHeroImageSrc(src: string): string {
  if (!src.startsWith("http")) return src

  try {
    const url = new URL(src)
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", "1920")
      url.searchParams.set("q", "85")
      url.searchParams.set("auto", "format")
      url.searchParams.set("fit", "crop")
    }
    return url.toString()
  } catch {
    return src
  }
}

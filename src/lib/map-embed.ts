export const MAP_ZOOM_MIN = 10
export const MAP_ZOOM_MAX = 20
export const MAP_ZOOM_DEFAULT = 16

export function buildGoogleEmbedSrc(mapQuery: string, zoom = MAP_ZOOM_DEFAULT) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`
}

export function buildGoogleEmbedFromCoords(lat: number, lng: number, zoom = MAP_ZOOM_DEFAULT) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
}

export function normalizeGoogleMapInput(raw?: string | null): string | null {
  if (!raw?.trim()) return null

  let input = raw.trim()

  const iframeSrc = input.match(/src=["']([^"']+)["']/i)
  if (iframeSrc?.[1]) {
    input = iframeSrc[1].trim()
  }

  if (input.startsWith("//")) {
    input = `https:${input}`
  } else if (input.startsWith("/maps/")) {
    input = `https://www.google.com${input}`
  } else if (!/^https?:\/\//i.test(input) && input.includes("google.com/maps")) {
    input = `https://${input.replace(/^\/+/, "")}`
  }

  return input
}

export function extractMapCoords(value?: string | null): { lat: number; lng: number } | null {
  const input = normalizeGoogleMapInput(value)
  if (!input) return null

  const latFrom3d = input.match(/!3d(-?\d+(?:\.\d+)?)/)
  const lngFrom2d = input.match(/!2d(-?\d+(?:\.\d+)?)/)
  if (latFrom3d && lngFrom2d) {
    return { lat: Number(latFrom3d[1]), lng: Number(lngFrom2d[1]) }
  }

  const coordMatch = input.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (coordMatch) {
    return { lat: Number(coordMatch[1]), lng: Number(coordMatch[2]) }
  }

  const atMatch = input.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) }
  }

  const qMatch = input.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (qMatch) {
    return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) }
  }

  return null
}

function extractMapQuery(value?: string | null): string | null {
  const input = normalizeGoogleMapInput(value)
  if (!input) return null

  const placeMatch = input.match(/\/maps\/place\/([^/?]+)/)
  if (placeMatch) {
    return decodeURIComponent(placeMatch[1].replace(/\+/g, " "))
  }

  const qMatch = input.match(/[?&]q=([^&]+)/)
  if (qMatch?.[1]) {
    const decoded = decodeURIComponent(qMatch[1].replace(/\+/g, " "))
    if (!/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(decoded)) {
      return decoded
    }
  }

  if (!/^https?:\/\//i.test(input)) return input
  return null
}

/** Build an embed URL with controllable zoom when possible. */
export function resolveZoomableMapEmbed(
  value?: string | null,
  zoom: number = MAP_ZOOM_DEFAULT
): { src: string | null; zoomable: boolean } {
  const input = normalizeGoogleMapInput(value)
  if (!input) return { src: null, zoomable: false }

  const coords = extractMapCoords(input)
  if (coords) {
    return {
      src: buildGoogleEmbedFromCoords(coords.lat, coords.lng, zoom),
      zoomable: true,
    }
  }

  const query = extractMapQuery(input)
  if (query) {
    return {
      src: buildGoogleEmbedSrc(query, zoom),
      zoomable: true,
    }
  }

  if (/^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(input)) {
    const [lat, lng] = input.split(",").map((part) => Number(part.trim()))
    return {
      src: buildGoogleEmbedFromCoords(lat, lng, zoom),
      zoomable: true,
    }
  }

  if (input.includes("/maps/embed")) {
    return { src: input, zoomable: false }
  }

  if (/^https?:\/\//i.test(input) && input.includes("google.com/maps")) {
    return { src: buildGoogleEmbedSrc(input, zoom), zoomable: true }
  }

  return { src: buildGoogleEmbedSrc(input, zoom), zoomable: true }
}

/** Accepts embed URLs, iframe HTML, place/share links, coordinates, or plain address text. */
export function resolveMapEmbedSrc(value?: string | null): string | null {
  return resolveZoomableMapEmbed(value).src
}

export function sanitizeMapFields<
  T extends { mapEmbedUrl?: string | null; mapQuery?: string | null },
>(data: T): T {
  const mapEmbedUrl = normalizeGoogleMapInput(data.mapEmbedUrl)
  const mapQuery = data.mapQuery?.trim() || null

  return {
    ...data,
    mapEmbedUrl,
    mapQuery,
  }
}

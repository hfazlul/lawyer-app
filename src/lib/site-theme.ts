/** Premium default: deep navy */
export const DEFAULT_THEME_NAVY = "220 52% 16%"
/** Premium default: muted champagne gold */
export const DEFAULT_THEME_GOLD = "38 42% 58%"

export const THEME_PRESETS = [
  {
    id: "classic",
    label: "Classic Navy & Gold",
    navy: DEFAULT_THEME_NAVY,
    gold: DEFAULT_THEME_GOLD,
  },
  {
    id: "royal",
    label: "Royal Blue & Bronze",
    navy: "215 55% 22%",
    gold: "32 38% 52%",
  },
  {
    id: "midnight",
    label: "Midnight & Silver Gold",
    navy: "225 45% 12%",
    gold: "45 30% 65%",
  },
  {
    id: "forest",
    label: "Deep Teal & Amber",
    navy: "195 45% 18%",
    gold: "36 55% 55%",
  },
] as const

export function resolveThemeNavy(value?: string | null) {
  return value?.trim() || DEFAULT_THEME_NAVY
}

export function resolveThemeGold(value?: string | null) {
  return value?.trim() || DEFAULT_THEME_GOLD
}

export function hexToHslComponents(hex: string): string {
  const normalized = hex.replace("#", "")
  if (normalized.length !== 6) return DEFAULT_THEME_NAVY

  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6
        break
      case g:
        h = (b - r) / delta + 2
        break
      default:
        h = (r - g) / delta + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function hslComponentsToHex(hsl: string): string {
  const match = hsl.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/)
  if (!match) return "#1e2a3f"

  const h = Number(match[1]) / 360
  const s = Number(match[2]) / 100
  const l = Number(match[3]) / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    let x = t
    if (x < 0) x += 1
    if (x > 1) x -= 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }

  let r: number
  let g: number
  let b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0")

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function buildSiteThemeCss(navy?: string | null, gold?: string | null): string {
  const navyHsl = resolveThemeNavy(navy)
  const goldHsl = resolveThemeGold(gold)

  return `
    .site-shell {
      --navy: ${navyHsl};
      --gold: ${goldHsl};
      --primary: ${navyHsl};
      --accent: ${goldHsl};
      --ring: ${goldHsl};
      --secondary: ${goldHsl.split(" ")[0]} 35% 94%;
    }
  `.trim()
}

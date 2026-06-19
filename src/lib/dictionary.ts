import type { Language } from "@/types"

export function t(obj: { en: string; bn: string } | string, lang: Language): string {
  if (typeof obj === "string") return obj
  if (obj && typeof obj === "object" && "en" in obj && "bn" in obj) {
    return lang === "bn" ? obj.bn || obj.en : obj.en || obj.bn
  }
  return String(obj)
}

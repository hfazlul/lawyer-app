import { cache } from "react"
import { cookies } from "next/headers"
import type { Language } from "@/types"
import { getSiteSettings } from "@/lib/public-data-cache"

export const getLangFromCookies = cache(async (): Promise<Language> => {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get("lang")?.value
  if (cookieLang === "bn" || cookieLang === "en") return cookieLang

  const settings = await getSiteSettings()
  return settings?.defaultLanguage === "bn" ? "bn" : "en"
})

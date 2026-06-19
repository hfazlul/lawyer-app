import { cache } from "react"
import { cookies } from "next/headers"
import type { Language } from "@/types"

export const getLangFromCookies = cache(async (): Promise<Language> => {
  const cookieStore = await cookies()
  return cookieStore.get("lang")?.value === "bn" ? "bn" : "en"
})

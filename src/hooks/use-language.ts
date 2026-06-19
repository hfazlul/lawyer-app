"use client"
import { create } from "zustand"
import { useCallback, useEffect } from "react"
type Lang = "en" | "bn"
interface LangState { lang: Lang; setLang: (lang: Lang) => void }
const useLangStore = create<LangState>(set => ({
  lang: "en",
  setLang: (lang) => { document.cookie = `lang=${lang}; path=/; max-age=31536000`; set({ lang }) }
}))
export function useLanguage() {
  const { lang, setLang } = useLangStore()
  useEffect(() => {
    const match = document.cookie.match(/lang=([^;]+)/)
    if (match && (match[1] === "en" || match[1] === "bn")) setLang(match[1])
  }, [setLang])
  const t = useCallback((obj: { en: string; bn: string } | string) => {
    if (typeof obj === "string") return obj
    return lang === "bn" ? obj.bn : obj.en
  }, [lang])
  return { lang, setLang, t }
}

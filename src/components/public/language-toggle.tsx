"use client"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"

export function LanguageToggle({ initialLang }: { initialLang?: "en" | "bn" }) {
  const { lang, setLang } = useLanguage(initialLang)
  const router = useRouter()

  const switchLang = (next: "en" | "bn") => {
    setLang(next)
    router.refresh()
  }

  return (
    <div className="flex rounded-md border border-border/60">
      <Button
        variant={lang === "en" ? "default" : "ghost"}
        size="sm"
        className="rounded-r-none"
        onClick={() => switchLang("en")}
      >
        EN
      </Button>
      <Button
        variant={lang === "bn" ? "default" : "ghost"}
        size="sm"
        className="rounded-l-none"
        onClick={() => switchLang("bn")}
      >
        বাংলা
      </Button>
    </div>
  )
}

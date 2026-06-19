import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

interface PageBannerProps {
  title: { en: string; bn: string }
  subtitle?: { en: string; bn: string }
  lang: Language
}

export function PageBanner({ title, subtitle, lang }: PageBannerProps) {
  return (
    <div className="relative overflow-hidden bg-navy py-20 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(43_74%_49%_/_0.12),_transparent_60%)]" />
      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gold" />
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
          {t(title, lang)}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            {t(subtitle, lang)}
          </p>
        )}
      </div>
    </div>
  )
}

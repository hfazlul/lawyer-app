"use client"

import { useCounter } from "@/hooks/use-counter"
import { EmptyState } from "./empty-state"
import type { SuccessStat } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

function StatItem({ number, title, lang }: { number: number; title: { en: string; bn: string }; lang: Language }) {
  const count = useCounter(number)
  return (
    <div className="text-center">
      <p className="font-serif text-4xl font-bold text-gold md:text-5xl">{count}+</p>
      <p className="mt-2 text-sm font-medium text-white/80">{t(title, lang)}</p>
    </div>
  )
}

export function SuccessStats({ stats, lang }: { stats: SuccessStat[]; lang: Language }) {
  return (
    <section className="bg-navy py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gold" />
          <h2 className="font-serif text-3xl font-bold md:text-4xl">
            {lang === "bn" ? "আমাদের সাফল্য" : "Our Success"}
          </h2>
        </div>
        {stats.length === 0 ? (
          <EmptyState
            lang={lang}
            title={{ en: "Statistics coming soon", bn: "পরিসংখ্যান শীঘ্রই" }}
            className="border-white/20 bg-white/5 [&_h3]:text-white [&_p]:text-white/70"
          />
        ) : (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <StatItem
                key={stat.id}
                number={stat.number}
                title={{ en: stat.titleEn, bn: stat.titleBn }}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

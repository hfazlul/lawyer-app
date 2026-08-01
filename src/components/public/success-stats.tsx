"use client"

import { motion } from "framer-motion"
import { useCounter, useInView } from "@/hooks/use-counter"
import { EmptyState } from "./empty-state"
import type { SuccessStat } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

function StatItem({
  number,
  title,
  lang,
  active,
  delay,
}: {
  number: number
  title: { en: string; bn: string }
  lang: Language
  active: boolean
  delay: number
}) {
  const count = useCounter(number, 1600, active)
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="font-serif text-4xl font-bold tabular-nums text-gold md:text-5xl">
        {count}+
      </p>
      <p className="mt-2 text-sm font-medium text-white/80">{t(title, lang)}</p>
    </motion.div>
  )
}

export function SuccessStats({ stats, lang }: { stats: SuccessStat[]; lang: Language }) {
  const { ref, inView } = useInView<HTMLElement>(0.35)

  return (
    <section ref={ref} className="public-section bg-navy text-white">
      <div className="site-container">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-3xl font-bold md:text-4xl">
            {lang === "bn" ? "আমাদের সাফল্য" : "Our Success"}
          </h2>
        </motion.div>
        {stats.length === 0 ? (
          <EmptyState
            lang={lang}
            title={{ en: "Statistics coming soon", bn: "পরিসংখ্যান শীঘ্রই" }}
            className="border-white/20 bg-white/5 [&_h3]:text-white [&_p]:text-white/70"
          />
        ) : (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <StatItem
                key={stat.id}
                number={stat.number}
                title={{ en: stat.titleEn, bn: stat.titleBn }}
                lang={lang}
                active={inView}
                delay={i * 0.08}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

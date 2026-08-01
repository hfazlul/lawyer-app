"use client"

import { useState, useEffect, useCallback } from "react"
import { CmsImage } from "@/components/public/cms-image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState } from "./empty-state"
import type { Activity } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

const AUTO_INTERVAL_MS = 5000

export function ActivitiesSlider({ activities, lang }: { activities: Activity[]; lang: Language }) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? activities.length - 1 : i - 1))
  }, [activities.length])

  const next = useCallback(() => {
    setIndex((i) => (i === activities.length - 1 ? 0 : i + 1))
  }, [activities.length])

  useEffect(() => {
    if (activities.length <= 1 || isPaused) return
    const timer = setInterval(next, AUTO_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [activities.length, isPaused, next, index])

  if (activities.length === 0) {
    return (
      <section className="public-section">
        <div className="site-container">
          <EmptyState
            lang={lang}
            title={{ en: "Activities", bn: "কার্যক্রম" }}
            description={{
              en: "Firm activities and events will be showcased here.",
              bn: "ফার্মের কার্যক্রম ও ইভেন্ট এখানে দেখানো হবে।",
            }}
          />
        </div>
      </section>
    )
  }

  const current = activities[index]

  return (
    <section
      className="public-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="site-container">
        <div className="mb-12 text-center">
          <h2 className="section-heading">
            {lang === "bn" ? "কার্যক্রম" : "Activities"}
          </h2>
        </div>
        <div className="activities-slider-inner relative mx-auto max-w-4xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.id}-${current.image}`}
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -56 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="relative mb-6 aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted shadow-lg md:aspect-video">
                <CmsImage
                  src={current.image}
                  alt={t({ en: current.titleEn, bn: current.titleBn }, lang)}
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-contain object-center"
                />
              </div>
              <h3 className="font-serif text-xl font-semibold text-navy">
                {t({ en: current.titleEn, bn: current.titleBn }, lang)}
              </h3>
              {(current.captionEn || current.captionBn) && (
                <p className="mt-2 text-muted-foreground">
                  {t({ en: current.captionEn || "", bn: current.captionBn || "" }, lang)}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
          {activities.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute -left-2 top-1/3 rounded-full border bg-background p-2 shadow-md transition-colors hover:bg-muted md:-left-12"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6 text-navy" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute -right-2 top-1/3 rounded-full border bg-background p-2 shadow-md transition-colors hover:bg-muted md:-right-12"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6 text-navy" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

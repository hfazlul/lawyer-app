"use client"

import { useState } from "react"
import { CmsImage } from "@/components/public/cms-image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState } from "./empty-state"
import type { Activity } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

export function ActivitiesSlider({ activities, lang }: { activities: Activity[]; lang: Language }) {
  const [index, setIndex] = useState(0)

  if (activities.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
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
  const prev = () => setIndex((i) => (i === 0 ? activities.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === activities.length - 1 ? 0 : i + 1))

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gold" />
          <h2 className="section-heading">
            {lang === "bn" ? "কার্যক্রম" : "Activities"}
          </h2>
        </div>
        <div className="relative mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.id}-${current.image}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="relative mb-6 h-64 overflow-hidden rounded-lg shadow-lg md:h-80">
                <CmsImage
                  src={current.image}
                  alt={t({ en: current.titleEn, bn: current.titleBn }, lang)}
                  fill
                  className="object-cover"
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

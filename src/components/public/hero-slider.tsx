"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { CmsImage } from "@/components/public/cms-image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./empty-state"
import type { HeroSlide } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

const AUTO_INTERVAL_MS = 4500

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
}

const textVariants = {
  enter: {
    opacity: 0,
    y: 28,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
}

export function HeroSlider({ slides, lang }: { slides: HeroSlide[]; lang: Language }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const autoDirectionRef = useRef(1)

  const goTo = useCallback(
    (nextIndex: number, dir: number) => {
      setDirection(dir)
      setIndex(nextIndex)
      setProgressKey((k) => k + 1)
    },
    []
  )

  const prev = useCallback(() => {
    goTo(index === 0 ? slides.length - 1 : index - 1, -1)
  }, [index, slides.length, goTo])

  const next = useCallback(() => {
    goTo(index === slides.length - 1 ? 0 : index + 1, 1)
  }, [index, slides.length, goTo])

  const autoNext = useCallback(() => {
    const dir = autoDirectionRef.current
    autoDirectionRef.current = dir === 1 ? -1 : 1
    goTo(index === slides.length - 1 ? 0 : index + 1, dir)
  }, [index, slides.length, goTo])

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return

    const timer = setInterval(autoNext, AUTO_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [slides.length, isPaused, autoNext, index])

  if (slides.length === 0) {
    return (
      <section className="relative flex h-[60vh] items-center justify-center bg-navy">
        <EmptyState
          lang={lang}
          title={{ en: "Welcome", bn: "স্বাগতম" }}
          description={{
            en: "Hero slides will appear here once configured in the admin panel.",
            bn: "অ্যাডমিন প্যানেলে কনফিগার করলে হিরো স্লাইড এখানে দেখাবে।",
          }}
          className="mx-4 border-white/20 bg-white/5 text-white [&_h3]:text-white [&_p]:text-white/70 [&_svg]:text-gold"
        />
      </section>
    )
  }

  const current = slides[index]

  return (
    <section
      className="group relative h-[60vh] overflow-hidden bg-navy md:h-[75vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false)
      }}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={`${current.id}-${current.image}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <CmsImage
            src={current.image}
            alt={t({ en: current.titleEn, bn: current.titleBn }, lang)}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/70 to-navy/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-navy/20" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-[1] flex items-center">
        <div className="container mx-auto px-4 text-white md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ delay: 0.15, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-12 bg-gold/80" />
                <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                {t({ en: current.titleEn, bn: current.titleBn }, lang)}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg lg:text-xl">
                {t({ en: current.descriptionEn, bn: current.descriptionBn }, lang)}
              </p>
              {current.ctaLink && (
                <Button
                  asChild
                  size="lg"
                  className="mt-8 bg-gold px-8 font-semibold text-navy shadow-[0_4px_14px_hsl(var(--gold)/0.35)] transition-all hover:bg-gold/90 hover:shadow-[0_6px_20px_hsl(var(--gold)/0.4)]"
                >
                  <Link href={current.ctaLink}>
                    {t({ en: current.ctaTextEn || "Learn More", bn: current.ctaTextBn || "আরও জানুন" }, lang)}
                  </Link>
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-navy/50 p-3 text-white opacity-80 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:bg-navy/70 md:opacity-0 md:group-hover:opacity-100 md:left-6"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-navy/50 p-3 text-white opacity-80 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:bg-navy/70 md:opacity-0 md:group-hover:opacity-100 md:right-6"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-navy/80 to-transparent px-4 pb-6 pt-12">
            <div className="container mx-auto flex items-center justify-center gap-3">
              {slides.map((slide, i) => {
                const active = i === index
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(i, i > index ? 1 : -1)}
                    className={`relative h-1 overflow-hidden rounded-full transition-all duration-300 ${
                      active ? "w-12 bg-white/15" : "w-6 bg-white/25 hover:bg-white/40"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={active ? "true" : undefined}
                  >
                    {active && (
                      <span
                        key={progressKey}
                        className={`hero-slide-progress absolute inset-y-0 left-0 rounded-full bg-gold ${
                          isPaused ? "hero-slide-progress-paused" : ""
                        }`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

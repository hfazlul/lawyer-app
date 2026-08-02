"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./empty-state"
import { getHeroImageSrc } from "@/lib/hero-image"
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
    y: 12,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -8,
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
      <section className="relative flex h-[clamp(210px,46.875vw,min(50vh,400px))] w-full items-center justify-center bg-navy sm:h-[48vh] md:h-[60vh]">
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
      className="group hero-section relative h-[clamp(210px,46.875vw,min(50vh,400px))] w-full overflow-hidden bg-navy sm:h-[50vh] md:h-[75vh]"
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
          className="absolute inset-0 overflow-hidden"
        >
          <div className="relative h-full w-full">
            <Image
              src={getHeroImageSrc(current.image)}
              alt={t({ en: current.titleEn, bn: current.titleBn }, lang)}
              fill
              sizes="100vw"
              quality={90}
              className="object-cover object-center sm:object-[center_30%]"
              priority
              unoptimized={current.image.startsWith("/uploads/")}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy/75 via-navy/40 to-navy/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-navy/10" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-[1] flex items-center justify-center px-1 py-1 pb-7 sm:px-0 sm:py-0 sm:pb-0">
        <div className="site-chrome flex w-full justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ delay: 0.1, duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="hero-copy max-h-full"
            >
              <h1 className="hero-title line-clamp-2">
                {t({ en: current.titleEn, bn: current.titleBn }, lang)}
              </h1>
              {(current.descriptionEn || current.descriptionBn) && (
                <>
                  <div className="hero-divider hidden sm:flex" aria-hidden="true">
                    <span />
                  </div>
                  <p className="hero-description line-clamp-2 sm:line-clamp-none">
                    {t({ en: current.descriptionEn, bn: current.descriptionBn }, lang)}
                  </p>
                </>
              )}
              {current.ctaLink && (
                <div className="mt-2 flex justify-center sm:mt-5 md:mt-8">
                <Button
                  asChild
                  className="h-7 rounded-md bg-gold px-3 text-[10px] font-semibold text-navy shadow-[0_2px_10px_hsl(var(--gold)/0.3)] transition-all hover:bg-gold/90 sm:h-9 sm:rounded-lg sm:px-5 sm:text-sm sm:shadow-[0_4px_14px_hsl(var(--gold)/0.35)] md:px-8 md:text-base"
                >
                  <Link href={current.ctaLink}>
                    {t({ en: current.ctaTextEn || "Learn More", bn: current.ctaTextBn || "আরও জানুন" }, lang)}
                  </Link>
                </Button>
                </div>
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
            className="hero-nav-prev absolute top-[58%] z-10 -translate-y-1/2 rounded-full border border-white/15 bg-navy/50 p-1.5 text-white opacity-80 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:bg-navy/70 sm:top-1/2 sm:p-3 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="hero-nav-next absolute top-[58%] z-10 -translate-y-1/2 rounded-full border border-white/15 bg-navy/50 p-1.5 text-white opacity-80 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:bg-navy/70 sm:top-1/2 sm:p-3 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-navy/80 to-transparent pb-4 pt-8 sm:pb-6 sm:pt-12">
            <div className="site-chrome flex items-center justify-center gap-3">
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

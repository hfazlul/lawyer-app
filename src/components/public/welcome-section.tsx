"use client"

import { CmsImage } from "@/components/public/cms-image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { HomeIntro } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"
import { EmptyState } from "./empty-state"

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.32, 0.72, 0, 1] },
  },
}

export function WelcomeSection({ intro, lang }: { intro: HomeIntro | null; lang: Language }) {
  if (!intro) {
    return (
      <section className="site-container public-section">
        <EmptyState
          lang={lang}
          title={{ en: "Welcome", bn: "স্বাগতম" }}
          description={{
            en: "Introduction content will be displayed here once added.",
            bn: "ভূমিকা কন্টেন্ট যোগ করলে এখানে দেখাবে।",
          }}
        />
      </section>
    )
  }

  const degree = t({ en: intro.degreeEn || "", bn: intro.degreeBn || "" }, lang)

  return (
    <section className="w-full bg-muted/30 py-10 sm:py-14 md:py-24">
      <div className="site-container">
        <motion.h2
          className="mb-4 font-serif text-xl font-bold leading-snug tracking-tight text-navy sm:mb-6 sm:text-2xl md:mb-8 md:text-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
        >
          {t({ en: intro.titleEn, bn: intro.titleBn }, lang)}
        </motion.h2>

        <div className="grid items-start gap-5 sm:gap-8 md:grid-cols-[1fr_auto] md:gap-10 lg:gap-14">
          <motion.div
            className="min-w-0 space-y-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
          >
            <p className="whitespace-pre-line text-justify text-sm leading-6 text-muted-foreground [text-align-last:left] sm:text-base sm:leading-7 md:text-lg md:leading-8">
              {t({ en: intro.descriptionEn, bn: intro.descriptionBn }, lang)}
            </p>
            {intro.ctaLink && (
              <Link
                href={intro.ctaLink}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-navy px-6 text-sm font-medium text-white transition-colors hover:bg-navy/90"
              >
                {t({ en: intro.ctaTextEn || "Contact Us", bn: intro.ctaTextBn || "যোগাযোগ করুন" }, lang)}
              </Link>
            )}
          </motion.div>

          <motion.div
            className="mx-auto w-[210px] shrink-0 sm:w-[240px] md:mx-0 md:w-[260px] md:self-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.65, delay: 0.12, ease: [0.32, 0.72, 0, 1] },
              },
            }}
          >
            <div className="overflow-hidden rounded-lg border border-border/50 bg-white shadow-sm">
              {intro.lawyerImage ? (
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <CmsImage
                    src={intro.lawyerImage}
                    alt="Lawyer"
                    fill
                    sizes="260px"
                    className="object-cover object-top"
                  />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-muted/80 text-xs text-muted-foreground">
                  {lang === "bn" ? "ছবি শীঘ্রই" : "Photo soon"}
                </div>
              )}
              {degree ? (
                <div className="border-t border-border/60 px-3 py-2.5 text-center">
                  <p className="text-xs font-medium leading-snug text-navy sm:text-[13px]">{degree}</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

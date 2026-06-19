"use client"

import { CmsImage } from "@/components/public/cms-image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { HomeIntro } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"
import { Button } from "@/components/ui/button"
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
      <section className="container mx-auto px-4 py-20">
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

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="welcome-section-card overflow-hidden rounded-2xl border border-emerald-900/10 p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
            >
              <div className="h-1 w-12 rounded-full bg-gold" />
              <h2 className="section-heading">{t({ en: intro.titleEn, bn: intro.titleBn }, lang)}</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t({ en: intro.descriptionEn, bn: intro.descriptionBn }, lang)}
              </p>
              {intro.ctaLink && (
                <Button asChild className="bg-navy hover:bg-navy/90">
                  <Link href={intro.ctaLink}>
                    {t({ en: intro.ctaTextEn || "Contact Us", bn: intro.ctaTextBn || "যোগাযোগ করুন" }, lang)}
                  </Link>
                </Button>
              )}
            </motion.div>

            <motion.div
              className="mx-auto w-full max-w-sm md:max-w-md"
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
              <div className="space-y-4">
                {intro.lawyerImage ? (
                  <div className="relative h-52 overflow-hidden rounded-xl shadow-md sm:h-56 md:h-60">
                    <CmsImage src={intro.lawyerImage} alt="Lawyer" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-xl bg-muted/80 text-sm text-muted-foreground">
                    {lang === "bn" ? "ছবি শীঘ্রই" : "Photo coming soon"}
                  </div>
                )}
                {intro.degreeImage && (
                  <div className="relative h-32 overflow-hidden rounded-lg bg-white/60 shadow-sm sm:h-36">
                    <CmsImage src={intro.degreeImage} alt="Credentials" fill className="object-contain p-3" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

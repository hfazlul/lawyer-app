"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { EmptyState } from "./empty-state"
import type { Testimonial } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

function TestimonialCard({
  item,
  lang,
}: {
  item: Testimonial
  lang: Language
}) {
  return (
    <Card className="premium-card w-[min(100%,320px)] shrink-0 sm:w-[360px]">
      <CardContent className="p-6">
        <div className="mb-3 flex gap-1">
          {Array.from({ length: item.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-gold text-gold" />
          ))}
        </div>
        <p className="mb-4 italic leading-relaxed text-muted-foreground">
          &ldquo;{t({ en: item.reviewEn, bn: item.reviewBn }, lang)}&rdquo;
        </p>
        <p className="font-semibold text-navy">— {item.clientName}</p>
      </CardContent>
    </Card>
  )
}

export function Testimonials({ testimonials, lang }: { testimonials: Testimonial[]; lang: Language }) {
  const loopItems = testimonials.length > 1 ? [...testimonials, ...testimonials] : testimonials

  return (
    <section className="public-section bg-secondary/30">
      <div className="site-container">
        <div className="mb-12 text-center">
          <h2 className="section-heading">
            {lang === "bn" ? "ক্লায়েন্ট মতামত" : "Client Testimonials"}
          </h2>
        </div>
        {testimonials.length === 0 ? (
          <EmptyState
            lang={lang}
            title={{ en: "No testimonials yet", bn: "এখনও কোনো মতামত নেই" }}
            description={{
              en: "Client reviews will appear here once added.",
              bn: "ক্লায়েন্ট রিভিউ যোগ করলে এখানে দেখাবে।",
            }}
          />
        ) : testimonials.length === 1 ? (
          <div className="mx-auto max-w-md">
            <TestimonialCard item={testimonials[0]} lang={lang} />
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-secondary/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-secondary/80 to-transparent" />
            <div className="overflow-hidden">
              <div className="testimonial-marquee flex w-max gap-6 py-1">
              {loopItems.map((item, i) => (
                <TestimonialCard key={`${item.id}-${i}`} item={item} lang={lang} />
              ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

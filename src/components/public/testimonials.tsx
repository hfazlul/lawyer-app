import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { EmptyState } from "./empty-state"
import type { Testimonial } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

export function Testimonials({ testimonials, lang }: { testimonials: Testimonial[]; lang: Language }) {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gold" />
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.id} className="premium-card">
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
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

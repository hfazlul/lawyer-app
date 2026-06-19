import { CmsImage } from "@/components/public/cms-image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./empty-state"
import type { FeaturedService } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

export function FeaturedServices({ services, lang }: { services: FeaturedService[]; lang: Language }) {
  return (
    <section className="bg-secondary/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gold" />
          <h2 className="section-heading">
            {lang === "bn" ? "আমাদের সেবাসমূহ" : "Our Services"}
          </h2>
          <p className="section-subheading">
            {lang === "bn"
              ? "আপনার প্রয়োজন অনুযায়ী বিশেষজ্ঞ আইনি পরামর্শ"
              : "Expert legal counsel tailored to your needs"}
          </p>
        </div>
        {services.length === 0 ? (
          <EmptyState
            lang={lang}
            title={{ en: "No services yet", bn: "এখনও কোনো সেবা নেই" }}
            description={{
              en: "Featured services will appear here once published.",
              bn: "প্রকাশ করলে সেবাসমূহ এখানে দেখাবে।",
            }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <Card key={service.id} className="premium-card group">
                <CardContent className="p-6">
                  {service.icon && (
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 transition-colors group-hover:bg-gold/25">
                      <CmsImage src={service.icon} alt="" width={28} height={28} />
                    </div>
                  )}
                  <h3 className="mb-2 font-serif text-xl font-semibold text-navy">
                    {t({ en: service.titleEn, bn: service.titleBn }, lang)}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {t({ en: service.descriptionEn, bn: service.descriptionBn }, lang)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="border-navy/20 hover:bg-navy hover:text-white">
                    <Link href={service.linkToService || "/services"}>
                      {lang === "bn" ? "বিস্তারিত" : "Learn More"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

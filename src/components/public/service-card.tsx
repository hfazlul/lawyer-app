import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ServiceCardHeader } from "@/components/public/service-card-header"
import type { ServiceGridItem } from "@/types/service-grid"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

export function ServiceCard({
  item,
  lang,
  showAppointment = true,
}: {
  item: ServiceGridItem
  lang: Language
  showAppointment?: boolean
}) {
  const title = t({ en: item.titleEn, bn: item.titleBn }, lang)
  const description = t({ en: item.descriptionEn, bn: item.descriptionBn }, lang)

  return (
    <Card className="premium-card group flex h-full flex-col overflow-hidden">
      <div className="p-4 pb-0">
        <ServiceCardHeader src={item.icon} alt={title} />
      </div>
      <CardContent className="flex flex-1 flex-col p-6 pt-4">
        <h3 className="mb-2 font-serif text-xl font-semibold leading-snug text-navy">{title}</h3>
        <p className="mb-5 min-h-[5.5rem] flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-4">
          {description}
        </p>
        <div className="mt-auto flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            className="bg-navy hover:bg-navy/90"
          >
            <Link href={item.href}>
              {lang === "bn" ? "সম্পূর্ণ বিবরণ" : "View Details"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          {showAppointment && (
            <Button asChild variant="outline" size="sm" className="border-navy/20 hover:bg-navy/5">
              <Link href="/appointment">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                {lang === "bn" ? "অ্যাপয়েন্টমেন্ট" : "Appointment"}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

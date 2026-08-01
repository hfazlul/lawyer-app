import { OfficeMap } from "@/components/public/office-map"
import type { Language } from "@/types"

interface OfficeLocationSectionProps {
  lang: Language
  mapEmbedUrl?: string | null
  mapQuery?: string | null
  mapImage?: string | null
  mapLabel?: string | null
}

export function OfficeLocationSection({
  lang,
  mapEmbedUrl,
  mapQuery,
  mapImage,
  mapLabel,
}: OfficeLocationSectionProps) {
  return (
    <section className="w-full border-t border-border/60 bg-muted/20 py-10 md:py-12">
      <div className="site-container mb-6">
        <h2 className="font-serif text-2xl font-bold text-navy md:text-3xl">
          {lang === "bn" ? "আমাদের অফিসের অবস্থান" : "Our Office Location"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {lang === "bn"
            ? "হাইলাইট করা জোনে আমাদের অফিসের অবস্থান দেখুন এবং জুম বাটন দিয়ে কাছে বা দূরে দেখুন।"
            : "See our office inside the highlighted zone and use the zoom buttons to look closer or wider."}
        </p>
      </div>
      <OfficeMap
        fullWidth
        mapEmbedUrl={mapEmbedUrl}
        mapQuery={mapQuery}
        mapImage={mapImage}
        mapLabel={mapLabel}
        placeholder={lang === "bn" ? "মানচিত্র শীঘ্রই" : "Map coming soon"}
      />
    </section>
  )
}

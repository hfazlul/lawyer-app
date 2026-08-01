"use client"

import { PaginatedServiceGrid } from "@/components/public/paginated-service-grid"
import { servicePageToGridItem } from "@/lib/service-links"
import { EmptyState } from "./empty-state"
import type { ServicePage } from "@prisma/client"
import type { Language } from "@/types"

export function FeaturedServices({
  services,
  lang,
}: {
  services: ServicePage[]
  lang: Language
}) {
  const gridItems = services.map(servicePageToGridItem)

  return (
    <section className="public-section bg-secondary/50">
      <div className="site-container">
        <div className="mb-12 text-center">
          <h2 className="section-heading">
            {lang === "bn" ? "আমাদের সেবাসমূহ" : "Our Services"}
          </h2>
          <p className="section-subheading">
            {lang === "bn"
              ? "আপনার প্রয়োজন অনুযায়ী বিশেষজ্ঞ আইনি পরামর্শ"
              : "Expert legal counsel tailored to your needs"}
          </p>
        </div>
        {gridItems.length === 0 ? (
          <EmptyState
            lang={lang}
            title={{ en: "No services yet", bn: "এখনও কোনো সেবা নেই" }}
            description={{
              en: "Add services in the Services CMS — they appear here and on the services page.",
              bn: "Services CMS থেকে সেবা যোগ করলে এখানে ও সেবা পৃষ্ঠায় দেখাবে।",
            }}
          />
        ) : (
          <PaginatedServiceGrid items={gridItems} lang={lang} />
        )}
      </div>
    </section>
  )
}

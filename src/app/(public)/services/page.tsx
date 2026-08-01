import type { Metadata } from "next"
import { getLangFromCookies } from "@/lib/lang"
import { buildPublicMetadata } from "@/lib/public-metadata"
import { getServices, getServicesSetting } from "@/lib/public-data-cache"
import { PageBanner } from "@/components/public/page-banner"
import { EmptyState } from "@/components/public/empty-state"
import { PaginatedServiceGrid } from "@/components/public/paginated-service-grid"
import { servicePageToGridItem } from "@/lib/service-links"
import { resolveBannerText } from "@/lib/page-banner"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies()
  return buildPublicMetadata("services", lang)
}

export default async function ServicesPage() {
  const [lang, services, listingHero] = await Promise.all([
    getLangFromCookies(),
    getServices(),
    getServicesSetting(),
  ])
  const gridItems = services.map(servicePageToGridItem)

  const banner = resolveBannerText(
    { en: listingHero?.bannerTitleEn, bn: listingHero?.bannerTitleBn },
    { en: listingHero?.bannerSubtitleEn, bn: listingHero?.bannerSubtitleBn },
    {
      title: { en: "Our Legal Services", bn: "আমাদের আইনি সেবাসমূহ" },
      subtitle: {
        en: "Comprehensive legal solutions with integrity and expertise",
        bn: "সততা ও দক্ষতার সাথে বিস্তৃত আইনি সমাধান",
      },
    }
  )

  return (
    <>
      <PageBanner title={banner.title} subtitle={banner.subtitle} lang={lang} />
      <section className="public-section">
        <div className="site-container">
          {gridItems.length === 0 ? (
            <EmptyState
              lang={lang}
              title={{ en: "No services published", bn: "কোনো সেবা প্রকাশিত নেই" }}
              description={{
                en: "Legal services will be listed here once they are added to the CMS.",
                bn: "সিএমএস-এ সেবা যোগ করলে এখানে তালিকাভুক্ত হবে।",
              }}
            />
          ) : (
            <PaginatedServiceGrid items={gridItems} lang={lang} />
          )}
        </div>
      </section>
    </>
  )
}

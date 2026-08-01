import type { Metadata } from "next"
import { getLangFromCookies } from "@/lib/lang"
import { buildPublicMetadata } from "@/lib/public-metadata"
import { HeroSlider } from "@/components/public/hero-slider"
import { WelcomeSection } from "@/components/public/welcome-section"
import { FeaturedServices } from "@/components/public/featured-services"
import { SuccessStats } from "@/components/public/success-stats"
import { ActivitiesSlider } from "@/components/public/activities-slider"
import { Testimonials } from "@/components/public/testimonials"
import { getHomeSections, getServices } from "@/lib/public-data-cache"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies()
  return buildPublicMetadata("home", lang)
}

export default async function HomePage() {
  const [lang, data, servicePages] = await Promise.all([
    getLangFromCookies(),
    getHomeSections(),
    getServices(),
  ])
  return (
    <>
      <HeroSlider slides={data.heroSlides} lang={lang} />
      <WelcomeSection intro={data.intro} lang={lang} />
      <FeaturedServices services={servicePages} lang={lang} />
      <SuccessStats stats={data.successStats} lang={lang} />
      <ActivitiesSlider activities={data.activities} lang={lang} />
      <Testimonials testimonials={data.testimonials} lang={lang} />
    </>
  )
}

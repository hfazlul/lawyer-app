import { Suspense } from "react"
import { getLangFromCookies } from "@/lib/lang"
import { Header } from "@/components/public/header"
import { Navigation } from "@/components/public/navigation"
import { Footer } from "@/components/public/footer"
import { getSiteSettings, getNavItems } from "@/lib/public-data-cache"
import { PublicPageSkeleton } from "@/components/public/public-page-skeleton"
import { SiteTheme } from "@/components/public/site-theme"
import { SiteLayoutStyles } from "@/components/public/site-layout-styles"
import { ScrollToTopButton } from "@/components/public/scroll-to-top-button"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [lang, settings, navItems] = await Promise.all([
    getLangFromCookies(),
    getSiteSettings(),
    getNavItems(),
  ])

  return (
  <>
    <SiteTheme themeNavy={settings?.themeNavy} themeGold={settings?.themeGold} />
    <SiteLayoutStyles
      layoutFullWidth={settings?.layoutFullWidth}
      layoutMargin={settings?.layoutMargin}
    />
    <div className="site-shell" data-layout={settings?.layoutFullWidth ? "full" : "boxed"}>
      <div className="site-wrapper">
        <Header settings={settings} lang={lang} />
        <Navigation settings={settings} lang={lang} navItems={navItems} />
        <main className="flex-1">
          <Suspense fallback={<PublicPageSkeleton />}>{children}</Suspense>
        </main>
        <Footer settings={settings} lang={lang} />
      </div>
    </div>
    <ScrollToTopButton />
  </>
  )
}

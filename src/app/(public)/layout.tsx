import { Suspense } from "react"
import { getLangFromCookies } from "@/lib/lang"
import { Header } from "@/components/public/header"
import { Navigation } from "@/components/public/navigation"
import { Footer } from "@/components/public/footer"
import { getSiteSettings, getNavItems } from "@/lib/public-data-cache"
import { PublicPageSkeleton } from "@/components/public/public-page-skeleton"

export const dynamic = "force-dynamic"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [lang, settings, navItems] = await Promise.all([
    getLangFromCookies(),
    getSiteSettings(),
    getNavItems(),
  ])

  return (
    <div className="site-shell">
      <div className="site-wrapper">
        <Header settings={settings} lang={lang} />
        <Navigation settings={settings} lang={lang} navItems={navItems} />
        <main className="flex-1">
          <Suspense fallback={<PublicPageSkeleton />}>{children}</Suspense>
        </main>
        <Footer settings={settings} lang={lang} />
      </div>
    </div>
  )
}

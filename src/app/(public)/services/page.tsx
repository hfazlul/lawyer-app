import type { Metadata } from "next"
import { getLangFromCookies } from "@/lib/lang"
import { buildPublicMetadata } from "@/lib/public-metadata"
import { getServices } from "@/lib/public-data-cache"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageBanner } from "@/components/public/page-banner"
import { EmptyState } from "@/components/public/empty-state"
import Link from "next/link"
import { CmsImage } from "@/components/public/cms-image"
import { t } from "@/lib/dictionary"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies()
  return buildPublicMetadata("services", lang)
}

export default async function ServicesPage() {
  const [lang, services] = await Promise.all([getLangFromCookies(), getServices()])

  return (
    <>
      <PageBanner
        title={{ en: "Our Legal Services", bn: "আমাদের আইনি সেবাসমূহ" }}
        subtitle={{
          en: "Comprehensive legal solutions with integrity and expertise",
          bn: "সততা ও দক্ষতার সাথে বিস্তৃত আইনি সমাধান",
        }}
        lang={lang}
      />
      <section className="py-20">
        <div className="container mx-auto px-4">
          {services.length === 0 ? (
            <EmptyState
              lang={lang}
              title={{ en: "No services published", bn: "কোনো সেবা প্রকাশিত নেই" }}
              description={{
                en: "Legal services will be listed here once they are added to the CMS.",
                bn: "সিএমএস-এ সেবা যোগ করলে এখানে তালিকাভুক্ত হবে।",
              }}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Card key={s.id} className="premium-card flex h-full flex-col">
                  <CardContent className="flex h-full flex-col p-6">
                    {s.icon && (
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
                        <CmsImage src={s.icon} alt="" width={32} height={32} />
                      </div>
                    )}
                    <h3 className="mb-3 font-serif text-xl font-semibold text-navy">
                      {t({ en: s.titleEn, bn: s.titleBn }, lang)}
                    </h3>
                    <p className="flex-1 text-muted-foreground">
                      {t({ en: s.contentEn, bn: s.contentBn }, lang)}
                    </p>
                    <Button asChild className="mt-6 bg-navy hover:bg-navy/90">
                      <Link href="/appointment">
                        {lang === "bn" ? "অ্যাপয়েন্টমেন্ট" : "Book Appointment"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

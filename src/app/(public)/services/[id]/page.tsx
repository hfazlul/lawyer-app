import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Phone } from "lucide-react"
import { getLangFromCookies } from "@/lib/lang"
import { getServiceById, getSiteSettings } from "@/lib/public-data-cache"
import { PageBanner } from "@/components/public/page-banner"
import { ServiceCardHeader } from "@/components/public/service-card-header"
import { Button } from "@/components/ui/button"
import { resolveBannerText } from "@/lib/page-banner"
import { t } from "@/lib/dictionary"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const [lang, service, settings] = await Promise.all([
    getLangFromCookies(),
    getServiceById(Number(id)),
    getSiteSettings(),
  ])
  if (!service) return { title: "Service" }

  const siteName = t(
    { en: settings?.siteNameEn || "Law Firm", bn: settings?.siteNameBn || "আইন ফার্ম" },
    lang
  )
  const title = t({ en: service.titleEn, bn: service.titleBn }, lang)

  return {
    title: `${title} | ${siteName}`,
    description: t({ en: service.contentEn, bn: service.contentBn }, lang).slice(0, 160),
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params
  const serviceId = Number(id)
  if (!Number.isFinite(serviceId)) notFound()

  const [lang, service, settings] = await Promise.all([
    getLangFromCookies(),
    getServiceById(serviceId),
    getSiteSettings(),
  ])

  if (!service) notFound()

  const title = t({ en: service.titleEn, bn: service.titleBn }, lang)
  const content = t({ en: service.contentEn, bn: service.contentBn }, lang)

  const banner = resolveBannerText(
    {
      en: service.bannerTitleEn || service.titleEn,
      bn: service.bannerTitleBn || service.titleBn,
    },
    { en: service.bannerSubtitleEn, bn: service.bannerSubtitleBn },
    {
      title: { en: service.titleEn, bn: service.titleBn },
      subtitle: {
        en: "Detailed legal service information and how we can help you",
        bn: "বিস্তারিত আইনি সেবার তথ্য এবং আমরা কীভাবে সাহায্য করতে পারি",
      },
    }
  )

  return (
    <>
      <PageBanner title={banner.title} subtitle={banner.subtitle} lang={lang} />

      <section className="public-section">
        <div className="site-container">
          <Link
            href="/services"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "bn" ? "সব সেবায় ফিরে যান" : "Back to all services"}
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
              <ServiceCardHeader src={service.icon} alt={title} className="rounded-xl" />
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {lang === "bn" ? "আইনি সেবা" : "Legal Service"}
              </p>
              <h1 className="font-serif text-3xl font-bold leading-tight text-navy md:text-4xl">
                {title}
              </h1>
              <div className="my-6 h-px w-16 bg-gradient-to-r from-gold/80 to-transparent" />

              <div className="space-y-4 text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
                {content.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} className="text-justify [text-align-last:left]">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-navy hover:bg-navy/90">
                  <Link href="/appointment">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {lang === "bn" ? "অ্যাপয়েন্টমেন্ট বুক করুন" : "Book Appointment"}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-navy/20">
                  <Link href="/contact">
                    <Phone className="mr-2 h-4 w-4" />
                    {lang === "bn" ? "যোগাযোগ করুন" : "Contact Us"}
                  </Link>
                </Button>
              </div>

              {settings?.footerPhone && (
                <p className="mt-6 text-sm text-muted-foreground">
                  {lang === "bn" ? "সরাসরি কল:" : "Direct line:"}{" "}
                  <a href={`tel:${settings.footerPhone}`} className="font-medium text-navy hover:underline">
                    {settings.footerPhone}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

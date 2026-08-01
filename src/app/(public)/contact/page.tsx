import type { Metadata } from "next"
import { getLangFromCookies } from "@/lib/lang"
import { buildPublicMetadata } from "@/lib/public-metadata"
import { getContactSetting } from "@/lib/public-data-cache"
import { ContactForm } from "@/components/public/forms/contact-form"
import { Card } from "@/components/ui/card"
import { PageBanner } from "@/components/public/page-banner"
import { OfficeLocationSection } from "@/components/public/office-location-section"
import { resolveBannerText } from "@/lib/page-banner"
import { t } from "@/lib/dictionary"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies()
  return buildPublicMetadata("contact", lang)
}

export default async function ContactPage() {
  const [lang, settings] = await Promise.all([getLangFromCookies(), getContactSetting()])

  const mapLabel = t(
    { en: settings?.addressEn || "Our Office", bn: settings?.addressBn || "আমাদের অফিস" },
    lang
  )

  const banner = resolveBannerText(
    { en: settings?.bannerTitleEn, bn: settings?.bannerTitleBn },
    { en: settings?.bannerSubtitleEn, bn: settings?.bannerSubtitleBn },
    {
      title: { en: "Contact Us", bn: "যোগাযোগ করুন" },
      subtitle: {
        en: "We are here to answer your questions",
        bn: "আপনার প্রশ্নের উত্তর দিতে আমরা এখানে আছি",
      },
    }
  )

  return (
    <>
      <PageBanner title={banner.title} subtitle={banner.subtitle} lang={lang} />
      <section className="py-20">
        <div className="site-container">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-serif text-2xl font-bold text-navy">
                {lang === "bn" ? "যোগাযোগ ফর্ম" : "Contact Form"}
              </h2>
              <ContactForm lang={lang} />
            </div>
            <div>
              <Card className="p-6">
                <h3 className="mb-3 font-semibold text-navy">
                  {lang === "bn" ? "ঠিকানা" : "Address"}
                </h3>
                <p className="text-muted-foreground">
                  {t({ en: settings?.addressEn || "", bn: settings?.addressBn || "" }, lang)}
                </p>
                {settings?.phone && (
                  <p className="mt-3">
                    <strong>{lang === "bn" ? "ফোন:" : "Phone:"}</strong> {settings.phone}
                  </p>
                )}
                {settings?.email && (
                  <p>
                    <strong>Email:</strong> {settings.email}
                  </p>
                )}
                {settings?.officeHoursEn && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t({ en: settings.officeHoursEn, bn: settings.officeHoursBn }, lang)}
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      <OfficeLocationSection
        lang={lang}
        mapEmbedUrl={settings?.mapEmbedUrl}
        mapQuery={settings?.mapQuery}
        mapImage={settings?.mapImage}
        mapLabel={mapLabel}
      />
    </>
  )
}

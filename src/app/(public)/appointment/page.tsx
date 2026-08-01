import type { Metadata } from "next"
import { getLangFromCookies } from "@/lib/lang"
import { buildPublicMetadata } from "@/lib/public-metadata"
import { getAppointmentSetting } from "@/lib/public-data-cache"
import { AppointmentForm } from "@/components/public/forms/appointment-form"
import { Card } from "@/components/ui/card"
import { PageBanner } from "@/components/public/page-banner"
import { OfficeLocationSection } from "@/components/public/office-location-section"
import { resolveBannerText } from "@/lib/page-banner"
import { t } from "@/lib/dictionary"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies()
  return buildPublicMetadata("appointment", lang)
}

export default async function AppointmentPage() {
  const [lang, settings] = await Promise.all([getLangFromCookies(), getAppointmentSetting()])

  const banner = resolveBannerText(
    { en: settings?.bannerTitleEn, bn: settings?.bannerTitleBn },
    { en: settings?.bannerSubtitleEn, bn: settings?.bannerSubtitleBn },
    {
      title: { en: "Schedule a Consultation", bn: "পরামর্শ নির্ধারণ করুন" },
      subtitle: {
        en: "Book a time to discuss your legal needs",
        bn: "আপনার আইনি প্রয়োজন নিয়ে আলোচনার জন্য সময় নির্ধারণ করুন",
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
                {lang === "bn" ? "অ্যাপয়েন্টমেন্ট ফর্ম" : "Appointment Form"}
              </h2>
              <AppointmentForm lang={lang} />
            </div>
            <div>
              <Card className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-navy">
                  {lang === "bn" ? "অফিস সময়" : "Office Hours"}
                </h3>
                <p className="text-muted-foreground">
                  {t(
                    {
                      en: settings?.officeHoursEn || "Sunday - Thursday, 9 AM - 6 PM",
                      bn: settings?.officeHoursBn || "রবিবার - বৃহস্পতিবার, সকাল ৯টা - সন্ধ্যা ৬টা",
                    },
                    lang
                  )}
                </p>
                {settings?.contactPhone && (
                  <p className="mt-3">
                    <strong>{lang === "bn" ? "ফোন:" : "Phone:"}</strong> {settings.contactPhone}
                  </p>
                )}
                {settings?.contactEmail && (
                  <p>
                    <strong>Email:</strong> {settings.contactEmail}
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
        mapLabel="District & Sessions Judge Court, Dhaka"
      />
    </>
  )
}

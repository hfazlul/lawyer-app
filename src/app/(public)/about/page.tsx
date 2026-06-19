import type { Metadata } from "next"
import { getLangFromCookies } from "@/lib/lang"
import { buildPublicMetadata } from "@/lib/public-metadata"
import { getAboutPage } from "@/lib/public-data-cache"
import { CmsImage } from "@/components/public/cms-image"
import { PageBanner } from "@/components/public/page-banner"
import { EmptyState } from "@/components/public/empty-state"
import { t } from "@/lib/dictionary"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies()
  return buildPublicMetadata("about", lang)
}

export default async function AboutPage() {
  const [lang, about] = await Promise.all([getLangFromCookies(), getAboutPage()])

  if (!about) {
    return (
      <>
        <PageBanner
          title={{ en: "About", bn: "পরিচিতি" }}
          lang={lang}
        />
        <section className="container mx-auto px-4 py-20">
          <EmptyState
            lang={lang}
            title={{ en: "About page not configured", bn: "পরিচিতি পৃষ্ঠা কনফিগার করা হয়নি" }}
            description={{
              en: "Biography and credentials will appear here once added.",
              bn: "জীবনী ও সনদপত্র যোগ করলে এখানে দেখাবে।",
            }}
          />
        </section>
      </>
    )
  }

  const valsEn: string[] = about.valuesEn ? JSON.parse(about.valuesEn) : []
  const valsBn: string[] = about.valuesBn ? JSON.parse(about.valuesBn) : []
  const values = lang === "bn" ? valsBn : valsEn

  return (
    <>
      <PageBanner
        title={{ en: "About", bn: "পরিচিতি" }}
        subtitle={{
          en: "Dedicated to justice, integrity, and client advocacy",
          bn: "ন্যায়বিচার, সততা ও ক্লায়েন্ট অ্যাডভোকেসির প্রতি নিবেদিত",
        }}
        lang={lang}
      />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative h-96 overflow-hidden rounded-lg shadow-lg">
              {about.image ? (
                <CmsImage src={about.image} alt="Lawyer" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                  {lang === "bn" ? "ছবি শীঘ্রই" : "Photo coming soon"}
                </div>
              )}
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 font-serif text-2xl font-bold text-navy">
                  {lang === "bn" ? "জীবনী" : "Biography"}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {t({ en: about.bioEn || "", bn: about.bioBn || "" }, lang)}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-navy">
                  {lang === "bn" ? "অভিজ্ঞতা" : "Experience"}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {t({ en: about.experienceEn || "", bn: about.experienceBn || "" }, lang)}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-navy">
                  {lang === "bn" ? "শিক্ষা" : "Education"}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {t({ en: about.educationEn || "", bn: about.educationBn || "" }, lang)}
                </p>
              </div>
            </div>
          </div>
          {values.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-center font-serif text-2xl font-bold text-navy">
                {lang === "bn" ? "আমাদের মূল্যবোধ" : "Our Values"}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {values.map((v: string, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gold/20 bg-gold/5 p-6 text-center transition-shadow hover:shadow-md"
                  >
                    <p className="font-semibold text-navy">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

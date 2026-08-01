import Link from "next/link"
import type { SiteSetting } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

export function Footer({ settings, lang }: { settings: SiteSetting | null; lang: Language }) {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto rounded-b-[var(--site-wrapper-radius,1rem)] border-t border-navy/20 bg-navy text-white/80">
      <div className="site-container py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-start">
          <div className="md:justify-self-start">
            <h3 className="font-serif text-lg font-semibold text-white">
              {t({ en: settings?.siteNameEn || "Law Firm", bn: settings?.siteNameBn || "আইন ফার্ম" }, lang)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed">
              {t(
                {
                  en: settings?.footerTextEn || "Premium legal services for your rights and justice.",
                  bn: settings?.footerTextBn || "আপনার অধিকার ও ন্যায়বিচারের জন্য প্রিমিয়াম আইনি সেবা।",
                },
                lang
              )}
            </p>
          </div>
          <div className="md:justify-self-center">
            <h4 className="mb-3 font-semibold text-gold">{lang === "bn" ? "যোগাযোগ" : "Contact"}</h4>
            {settings?.footerPhone && <p className="text-sm">{settings.footerPhone}</p>}
            {settings?.footerEmail && <p className="text-sm">{settings.footerEmail}</p>}
            <p className="text-sm">
              {t({ en: settings?.footerAddressEn || "", bn: settings?.footerAddressBn || "" }, lang)}
            </p>
          </div>
          <div className="md:mr-12 md:justify-self-end lg:mr-20">
            <h4 className="mb-3 font-semibold text-gold">{lang === "bn" ? "দ্রুত লিংক" : "Quick Links"}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="transition-colors hover:text-gold">{lang === "bn" ? "সেবাসমূহ" : "Services"}</Link></li>
              <li><Link href="/appointment" className="transition-colors hover:text-gold">{lang === "bn" ? "অ্যাপয়েন্টমেন্ট" : "Appointment"}</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-gold">{lang === "bn" ? "পরিচিতি" : "About"}</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-gold">{lang === "bn" ? "যোগাযোগ" : "Contact"}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/60">
          {t(
            {
              en: settings?.copyrightEn || `© ${year} Law Firm. All rights reserved.`,
              bn: settings?.copyrightBn || `© ${year} আইন ফার্ম। সর্বস্বত্ব সংরক্ষিত।`,
            },
            lang
          )}
        </div>
      </div>
    </footer>
  )
}

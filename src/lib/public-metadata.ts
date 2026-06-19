import type { Metadata } from "next"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"
import {
  getSiteSettings,
  getHomeIntro,
  getAboutPage,
  getAppointmentSetting,
  getContactSetting,
} from "@/lib/public-data-cache"

export type PublicPageKey = "home" | "services" | "about" | "appointment" | "contact" | "search"

export async function buildPublicMetadata(
  page: PublicPageKey,
  lang: Language
): Promise<Metadata> {
  const settings = await getSiteSettings()

  const siteName = t(
    { en: settings?.siteNameEn || "Law Firm", bn: settings?.siteNameBn || "আইন ফার্ম" },
    lang
  )

  const defaults: Record<PublicPageKey, { title: { en: string; bn: string }; description: { en: string; bn: string } }> = {
    home: {
      title: { en: siteName, bn: siteName },
      description: {
        en: settings?.footerTextEn || "Premium legal services for your rights and justice.",
        bn: settings?.footerTextBn || "আপনার অধিকার ও ন্যায়বিচারের জন্য প্রিমিয়াম আইনি সেবা।",
      },
    },
    services: {
      title: { en: `Legal Services | ${siteName}`, bn: `আইনি সেবা | ${siteName}` },
      description: {
        en: "Explore our comprehensive legal services and expert counsel.",
        bn: "আমাদের বিস্তৃত আইনি সেবা ও বিশেষজ্ঞ পরামর্শ দেখুন।",
      },
    },
    about: {
      title: { en: `About | ${siteName}`, bn: `পরিচিতি | ${siteName}` },
      description: {
        en: "Learn about our experience, education, and commitment to justice.",
        bn: "আমাদের অভিজ্ঞতা, শিক্ষা ও ন্যায়বিচারের প্রতি প্রতিশ্রুতি জানুন।",
      },
    },
    appointment: {
      title: { en: `Appointment | ${siteName}`, bn: `অ্যাপয়েন্টমেন্ট | ${siteName}` },
      description: {
        en: "Schedule a consultation with our legal team.",
        bn: "আমাদের আইনি দলের সাথে পরামর্শের সময় নির্ধারণ করুন।",
      },
    },
    contact: {
      title: { en: `Contact | ${siteName}`, bn: `যোগাযোগ | ${siteName}` },
      description: {
        en: "Contact our law office for inquiries and support.",
        bn: "জিজ্ঞাসা ও সহায়তার জন্য আমাদের আইন অফিসে যোগাযোগ করুন।",
      },
    },
    search: {
      title: { en: `Search | ${siteName}`, bn: `অনুসন্ধান | ${siteName}` },
      description: {
        en: "Search services and pages on our website.",
        bn: "আমাদের ওয়েবসাইটে সেবা ও পৃষ্ঠা অনুসন্ধান করুন।",
      },
    },
  }

  let meta = defaults[page]

  if (page === "home") {
    const intro = await getHomeIntro()
    if (intro) {
      meta = {
        title: { en: `${t({ en: intro.titleEn, bn: intro.titleBn }, "en")} | ${siteName}`, bn: `${t({ en: intro.titleEn, bn: intro.titleBn }, "bn")} | ${siteName}` },
        description: { en: intro.descriptionEn, bn: intro.descriptionBn },
      }
    }
  }

  if (page === "about") {
    const about = await getAboutPage()
    if (about?.bioEn || about?.bioBn) {
      meta = {
        ...meta,
        description: { en: about.bioEn || meta.description.en, bn: about.bioBn || meta.description.bn },
      }
    }
  }

  if (page === "appointment") {
    const appt = await getAppointmentSetting()
    if (appt) {
      meta = {
        title: {
          en: `${appt.bannerTitleEn} | ${siteName}`,
          bn: `${appt.bannerTitleBn} | ${siteName}`,
        },
        description: { en: appt.officeHoursEn, bn: appt.officeHoursBn },
      }
    }
  }

  if (page === "contact") {
    const contact = await getContactSetting()
    if (contact) {
      meta = {
        title: {
          en: `${contact.bannerTitleEn} | ${siteName}`,
          bn: `${contact.bannerTitleBn} | ${siteName}`,
        },
        description: {
          en: contact.addressEn || meta.description.en,
          bn: contact.addressBn || meta.description.bn,
        },
      }
    }
  }

  return {
    title: t(meta.title, lang),
    description: t(meta.description, lang),
    openGraph: {
      title: t(meta.title, lang),
      description: t(meta.description, lang),
      type: "website",
    },
  }
}

"use server"

import { prisma } from "@/lib/prisma"
import { DEFAULT_NAV_ITEMS } from "@/lib/constants"
import type { Language } from "@/types"

export interface SearchResult {
  href: string
  titleEn: string
  titleBn: string
  excerptEn: string
  excerptBn: string
  type: "page" | "service"
}

const STATIC_PAGES: SearchResult[] = [
  {
    href: "/",
    titleEn: "Home",
    titleBn: "হোম",
    excerptEn: "Welcome to our law firm",
    excerptBn: "আমাদের আইন ফার্মে স্বাগতম",
    type: "page",
  },
  {
    href: "/about",
    titleEn: "About",
    titleBn: "পরিচিতি",
    excerptEn: "Learn about our lawyer and experience",
    excerptBn: "আমাদের আইনজীবী ও অভিজ্ঞতা সম্পর্কে জানুন",
    type: "page",
  },
  {
    href: "/appointment",
    titleEn: "Appointment",
    titleBn: "অ্যাপয়েন্টমেন্ট",
    excerptEn: "Schedule a legal consultation",
    excerptBn: "আইনি পরামর্শের জন্য সময় নির্ধারণ করুন",
    type: "page",
  },
  {
    href: "/contact",
    titleEn: "Contact",
    titleBn: "যোগাযোগ",
    excerptEn: "Get in touch with our office",
    excerptBn: "আমাদের অফিসে যোগাযোগ করুন",
    type: "page",
  },
]

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query)
}

export async function searchSite(query: string, _lang: Language): Promise<SearchResult[]> {
  const trimmed = query.trim().toLowerCase()
  if (trimmed.length < 2) return []

  const [navItems, services, about] = await Promise.all([
    prisma.navItem.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
    prisma.servicePage.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
    prisma.aboutPage.findFirst(),
  ])

  const nav = navItems.length > 0 ? navItems : DEFAULT_NAV_ITEMS.map((item, i) => ({ id: i, ...item }))
  const results: SearchResult[] = []

  for (const page of STATIC_PAGES) {
    if (
      matchesQuery(page.titleEn, trimmed) ||
      matchesQuery(page.titleBn, trimmed) ||
      matchesQuery(page.excerptEn, trimmed) ||
      matchesQuery(page.excerptBn, trimmed)
    ) {
      results.push(page)
    }
  }

  for (const item of nav) {
    if (
      matchesQuery(item.labelEn, trimmed) ||
      matchesQuery(item.labelBn, trimmed) ||
      matchesQuery(item.href, trimmed)
    ) {
      if (!results.some((r) => r.href === item.href)) {
        results.push({
          href: item.href,
          titleEn: item.labelEn,
          titleBn: item.labelBn,
          excerptEn: "Navigation link",
          excerptBn: "নেভিগেশন লিংক",
          type: "page",
        })
      }
    }
  }

  for (const service of services) {
    if (
      matchesQuery(service.titleEn, trimmed) ||
      matchesQuery(service.titleBn, trimmed) ||
      matchesQuery(service.contentEn, trimmed) ||
      matchesQuery(service.contentBn, trimmed)
    ) {
      results.push({
        href: "/services",
        titleEn: service.titleEn,
        titleBn: service.titleBn,
        excerptEn: service.contentEn.slice(0, 120),
        excerptBn: service.contentBn.slice(0, 120),
        type: "service",
      })
    }
  }

  if (about) {
    const aboutFields = [
      about.bioEn,
      about.bioBn,
      about.experienceEn,
      about.experienceBn,
      about.educationEn,
      about.educationBn,
      about.missionEn,
      about.missionBn,
    ].filter(Boolean) as string[]

    if (aboutFields.some((f) => matchesQuery(f, trimmed))) {
      if (!results.some((r) => r.href === "/about")) {
        results.push({
          href: "/about",
          titleEn: "About",
          titleBn: "পরিচিতি",
          excerptEn: about.bioEn?.slice(0, 120) || "About our lawyer",
          excerptBn: about.bioBn?.slice(0, 120) || "আমাদের আইনজীবী সম্পর্কে",
          type: "page",
        })
      }
    }
  }

  return results.slice(0, 12)
}

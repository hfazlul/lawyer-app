import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { DEFAULT_NAV_ITEMS } from "@/lib/constants"

/** Per-request dedup only — no cross-request cache so CMS edits show immediately. */
export const getSiteSettings = cache(async () => prisma.siteSetting.findFirst())

export const getNavItems = cache(async () => {
  const items = await prisma.navItem.findMany({
    where: { status: "active" },
    orderBy: { sortOrder: "asc" },
  })
  if (items.length === 0) {
    return DEFAULT_NAV_ITEMS.map((item, index) => ({
      id: index + 1,
      ...item,
      status: "active" as const,
    }))
  }
  return items
})

export const getHomeSections = cache(async () => {
  const [heroSlides, intro, featuredServices, successStats, activities, testimonials] =
    await Promise.all([
      prisma.heroSlide.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
      prisma.homeIntro.findFirst(),
      prisma.featuredService.findMany({
        where: { status: "active" },
        orderBy: { sortOrder: "asc" },
        take: 6,
      }),
      prisma.successStat.findMany({ where: { status: "active" } }),
      prisma.activity.findMany({ where: { status: "active" }, orderBy: { id: "asc" } }),
      prisma.testimonial.findMany({ where: { status: "active" }, orderBy: { id: "asc" } }),
    ])
  return { heroSlides, intro, featuredServices, successStats, activities, testimonials }
})

export const getAboutPage = cache(async () => prisma.aboutPage.findFirst())

export const getServices = cache(async () =>
  prisma.servicePage.findMany({
    where: { status: "active" },
    orderBy: { sortOrder: "asc" },
  })
)

export const getAppointmentSetting = cache(async () => prisma.appointmentSetting.findFirst())

export const getContactSetting = cache(async () => prisma.contactSetting.findFirst())

export const getHomeIntro = cache(async () => prisma.homeIntro.findFirst())

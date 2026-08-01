import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { DEFAULT_NAV_ITEMS } from "@/lib/constants"
import { PUBLIC_CACHE_TAGS } from "@/lib/cache-tags"

/** Fallback TTL; CMS saves call revalidateTag() for instant updates. */
const PUBLIC_CACHE_REVALIDATE = 3600

export const getSiteSettings = unstable_cache(
  async () => prisma.siteSetting.findFirst(),
  ["public-site-settings"],
  { tags: [PUBLIC_CACHE_TAGS.siteSettings], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export const getNavItems = unstable_cache(
  async () => {
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
  },
  ["public-nav-items"],
  { tags: [PUBLIC_CACHE_TAGS.navItems], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export const getHomeSections = unstable_cache(
  async () => {
    const [heroSlides, intro, successStats, activities, testimonials] = await Promise.all([
      prisma.heroSlide.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
      prisma.homeIntro.findFirst(),
      prisma.successStat.findMany({ where: { status: "active" } }),
      prisma.activity.findMany({ where: { status: "active" }, orderBy: { id: "asc" } }),
      prisma.testimonial.findMany({ where: { status: "active" }, orderBy: { id: "asc" } }),
    ])
    return { heroSlides, intro, successStats, activities, testimonials }
  },
  ["public-home-sections"],
  { tags: [PUBLIC_CACHE_TAGS.homeSections], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export const getAboutPage = unstable_cache(
  async () => prisma.aboutPage.findFirst(),
  ["public-about-page"],
  { tags: [PUBLIC_CACHE_TAGS.aboutPage], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export const getServices = unstable_cache(
  async () =>
    prisma.servicePage.findMany({
      where: { status: "active" },
      orderBy: { sortOrder: "asc" },
    }),
  ["public-services"],
  { tags: [PUBLIC_CACHE_TAGS.services], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export async function getServiceById(id: number) {
  return prisma.servicePage.findFirst({
    where: { id, status: "active" },
  })
}

export const getServicesSetting = unstable_cache(
  async () => prisma.servicesSetting.findFirst(),
  ["public-services-setting"],
  { tags: [PUBLIC_CACHE_TAGS.servicesSetting], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export const getAppointmentSetting = unstable_cache(
  async () => prisma.appointmentSetting.findFirst(),
  ["public-appointment-setting"],
  { tags: [PUBLIC_CACHE_TAGS.appointmentSetting], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export const getContactSetting = unstable_cache(
  async () => prisma.contactSetting.findFirst(),
  ["public-contact-setting"],
  { tags: [PUBLIC_CACHE_TAGS.contactSetting], revalidate: PUBLIC_CACHE_REVALIDATE }
)

export const getHomeIntro = unstable_cache(
  async () => prisma.homeIntro.findFirst(),
  ["public-home-intro"],
  { tags: [PUBLIC_CACHE_TAGS.homeIntro], revalidate: PUBLIC_CACHE_REVALIDATE }
)

/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"

export const CMS_TABLES = {
  SiteSetting: "SiteSetting",
  NavItem: "NavItem",
  HeroSlide: "HeroSlide",
  HomeIntro: "HomeIntro",
  FeaturedService: "FeaturedService",
  SuccessStat: "SuccessStat",
  Activity: "Activity",
  Testimonial: "Testimonial",
  ServicePage: "ServicePage",
  AppointmentSetting: "AppointmentSetting",
  ContactSetting: "ContactSetting",
  AboutPage: "AboutPage",
} as const

export type CmsTableName = (typeof CMS_TABLES)[keyof typeof CMS_TABLES]

export const PUBLIC_PATHS = ["/", "/services", "/appointment", "/about", "/contact", "/search"] as const

export async function restoreArchivedRecord(tableName: string, data: Record<string, unknown>) {
  const id = (data.id as number) || 1
  const row = data as any

  switch (tableName) {
    case CMS_TABLES.SiteSetting:
      await prisma.siteSetting.upsert({ where: { id }, create: { ...row, id }, update: row })
      break
    case CMS_TABLES.NavItem:
      await prisma.navItem.upsert({ where: { id }, create: row, update: row })
      break
    case CMS_TABLES.HeroSlide:
      await prisma.heroSlide.upsert({ where: { id }, create: row, update: row })
      break
    case CMS_TABLES.HomeIntro:
      await prisma.homeIntro.upsert({ where: { id }, create: { ...row, id }, update: row })
      break
    case CMS_TABLES.FeaturedService:
      await prisma.featuredService.upsert({ where: { id }, create: row, update: row })
      break
    case CMS_TABLES.SuccessStat:
      await prisma.successStat.upsert({ where: { id }, create: row, update: row })
      break
    case CMS_TABLES.Activity:
      await prisma.activity.upsert({ where: { id }, create: row, update: row })
      break
    case CMS_TABLES.Testimonial:
      await prisma.testimonial.upsert({ where: { id }, create: row, update: row })
      break
    case CMS_TABLES.ServicePage:
      await prisma.servicePage.upsert({ where: { id }, create: row, update: row })
      break
    case CMS_TABLES.AppointmentSetting:
      await prisma.appointmentSetting.upsert({ where: { id }, create: { ...row, id }, update: row })
      break
    case CMS_TABLES.ContactSetting:
      await prisma.contactSetting.upsert({ where: { id }, create: { ...row, id }, update: row })
      break
    case CMS_TABLES.AboutPage:
      await prisma.aboutPage.upsert({ where: { id }, create: { ...row, id }, update: row })
      break
    default:
      throw new Error(`Unknown table: ${tableName}`)
  }
}

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
  ServicesSetting: "ServicesSetting",
  AppointmentSetting: "AppointmentSetting",
  ContactSetting: "ContactSetting",
  AboutPage: "AboutPage",
  AppointmentMessage: "AppointmentMessage",
  ContactMessage: "ContactMessage",
  Case: "Case",
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
    case CMS_TABLES.ServicesSetting:
      await prisma.servicesSetting.upsert({
        where: { id },
        create: { ...row, id },
        update: row,
      })
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
    case CMS_TABLES.AppointmentMessage:
      await prisma.appointmentMessage.upsert({
        where: { id },
        create: {
          id,
          name: row.name,
          phone: row.phone,
          email: row.email ?? null,
          serviceType: row.serviceType ?? null,
          preferredDate: row.preferredDate ? new Date(row.preferredDate as string) : null,
          message: row.message ?? null,
          status: row.status ?? "unread",
          createdAt: row.createdAt ? new Date(row.createdAt as string) : new Date(),
        },
        update: {
          name: row.name,
          phone: row.phone,
          email: row.email ?? null,
          serviceType: row.serviceType ?? null,
          preferredDate: row.preferredDate ? new Date(row.preferredDate as string) : null,
          message: row.message ?? null,
          status: row.status ?? "unread",
        },
      })
      break
    case CMS_TABLES.ContactMessage:
      await prisma.contactMessage.upsert({
        where: { id },
        create: {
          id,
          name: row.name,
          phone: row.phone,
          email: row.email ?? null,
          message: row.message ?? null,
          status: row.status ?? "unread",
          createdAt: row.createdAt ? new Date(row.createdAt as string) : new Date(),
        },
        update: {
          name: row.name,
          phone: row.phone,
          email: row.email ?? null,
          message: row.message ?? null,
          status: row.status ?? "unread",
        },
      })
      break
    case CMS_TABLES.Case: {
      const payload = row as { case: Record<string, unknown>; history?: Record<string, unknown>[] }
      const caseRow = payload.case
      if (!caseRow?.id) throw new Error("Invalid case archive data")

      const historyRows = payload.history ?? []
      const caseId = caseRow.id as number

      const caseData = {
        id: caseId,
        serial: (caseRow.serial as number | null) ?? null,
        clientName: caseRow.clientName as string,
        caseNo: caseRow.caseNo as string,
        court: caseRow.court as "JUDGE_COURT" | "HIGH_COURT" | "SUPREME_COURT",
        courtType: (caseRow.courtType as string) ?? "",
        caseType: caseRow.caseType as string,
        onBehalf: caseRow.onBehalf as "COMPLAINANT" | "ACCUSED",
        contactNo: caseRow.contactNo as string,
        email: (caseRow.email as string | null) ?? null,
        caseFileLink: (caseRow.caseFileLink as string | null) ?? null,
        previousDate: caseRow.previousDate ? new Date(caseRow.previousDate as string) : null,
        nextDate: caseRow.nextDate ? new Date(caseRow.nextDate as string) : null,
        steps: (caseRow.steps as string | null) ?? null,
        status: (caseRow.status as string) ?? "active",
        createdAt: caseRow.createdAt ? new Date(caseRow.createdAt as string) : new Date(),
        updatedAt: caseRow.updatedAt ? new Date(caseRow.updatedAt as string) : new Date(),
      }

      await prisma.$transaction(async (tx) => {
        await tx.caseHistory.deleteMany({ where: { caseId } })

        await tx.case.upsert({
          where: { id: caseId },
          create: caseData,
          update: {
            serial: caseData.serial,
            clientName: caseData.clientName,
            caseNo: caseData.caseNo,
            court: caseData.court,
            courtType: caseData.courtType,
            caseType: caseData.caseType,
            onBehalf: caseData.onBehalf,
            contactNo: caseData.contactNo,
            email: caseData.email,
            caseFileLink: caseData.caseFileLink,
            previousDate: caseData.previousDate,
            nextDate: caseData.nextDate,
            steps: caseData.steps,
            status: caseData.status,
            updatedAt: caseData.updatedAt,
          },
        })

        for (const entry of historyRows) {
          await tx.caseHistory.upsert({
            where: { id: entry.id as number },
            create: {
              id: entry.id as number,
              caseId,
              date: entry.date ? new Date(entry.date as string) : new Date(),
              action: entry.action as string,
              status: (entry.status as string) ?? "active",
              createdAt: entry.createdAt ? new Date(entry.createdAt as string) : new Date(),
            },
            update: {
              date: entry.date ? new Date(entry.date as string) : new Date(),
              action: entry.action as string,
              status: (entry.status as string) ?? "active",
            },
          })
        }
      })
      break
    }
    default:
      throw new Error(`Unknown table: ${tableName}`)
  }
}

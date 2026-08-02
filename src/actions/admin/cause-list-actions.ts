"use server"

import { prisma } from "@/lib/prisma"
import { requireCauseListViewer } from "@/lib/session"

export async function getScheduledCases() {
  await requireCauseListViewer()
  return prisma.case.findMany({
    where: {
      OR: [
        { nextDate: { not: null } },
        { status: { in: ["deactive", "failed"] }, previousDate: { not: null } },
      ],
    },
    orderBy: [{ nextDate: "asc" }, { updatedAt: "desc" }],
  })
}

export async function getTodayCases() {
  await requireCauseListViewer()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return prisma.case.findMany({
    where: { nextDate: { gte: today, lt: tomorrow }, status: "active" },
    orderBy: { nextDate: "asc" },
  })
}

export async function getNextDayCases() {
  await requireCauseListViewer()
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)
  return prisma.case.findMany({
    where: { nextDate: { gte: tomorrow, lt: dayAfter }, status: "active" },
    orderBy: { nextDate: "asc" },
  })
}

export async function getCauseListReportData(caseIds: number[]) {
  await requireCauseListViewer()
  if (caseIds.length === 0) return []

  return prisma.case.findMany({
    where: { id: { in: caseIds } },
    include: { history: { orderBy: { date: "desc" } } },
    orderBy: [{ nextDate: "asc" }, { clientName: "asc" }],
  })
}

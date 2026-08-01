"use server"

import { prisma } from "@/lib/prisma"

export async function getScheduledCases() {
  return prisma.case.findMany({
    where: { nextDate: { not: null } },
    orderBy: [{ nextDate: "asc" }, { updatedAt: "desc" }],
  })
}

export async function getTodayCases() {
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

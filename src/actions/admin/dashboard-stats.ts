"use server"

import { prisma } from "@/lib/prisma"
import { getSunThuWeekRange } from "@/lib/week-range"

export async function getDashboardStats() {
  const { start, end } = getSunThuWeekRange()
  const year = new Date().getFullYear()

  const [
    total,
    solved,
    failed,
    pending,
    running,
    monthlyRaw,
    yearlyRaw,
    courtDist,
  ] = await Promise.all([
    prisma.case.count(),
    prisma.case.count({ where: { status: "completed" } }),
    prisma.case.count({ where: { status: "failed" } }),
    prisma.case.count({ where: { status: "active" } }),
    prisma.case.count({
      where: {
        status: "active",
        nextDate: { gte: start, lte: end },
      },
    }),
    prisma.$queryRaw<{ month: number; count: number }[]>`
      SELECT EXTRACT(MONTH FROM "createdAt")::int AS month, COUNT(*)::int AS count
      FROM "Case"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
      GROUP BY month
      ORDER BY month
    `,
    prisma.$queryRaw<{ year: number; count: number }[]>`
      SELECT EXTRACT(YEAR FROM "createdAt")::int AS year, COUNT(*)::int AS count
      FROM "Case"
      GROUP BY year
      ORDER BY year
    `,
    prisma.case.groupBy({ by: ["court"], _count: true }),
  ])

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: monthlyRaw.find((m) => m.month === i + 1)?.count ?? 0,
  }))

  return {
    totalCases: total,
    solvedCases: solved,
    failedCases: failed,
    pendingCases: pending,
    runningCasesThisWeek: running,
    monthlyCases: monthly,
    yearlyCases: yearlyRaw,
    courtDistribution: courtDist,
  }
}

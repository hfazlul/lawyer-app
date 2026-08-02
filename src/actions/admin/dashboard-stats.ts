"use server"

import { prisma } from "@/lib/prisma"
import { getSunThuWeekRange } from "@/lib/week-range"
import { autoCompleteStaleActiveCases } from "@/actions/admin/case-actions"
import { isRunningActiveCase } from "@/lib/cause-list-filters"

export async function getDashboardStats() {
  await autoCompleteStaleActiveCases()

  const { start, end } = getSunThuWeekRange()
  const year = new Date().getFullYear()

  const activeCases = await prisma.case.findMany({ where: { status: "active" } })
  const runningActiveCount = activeCases.filter((c) => isRunningActiveCase(c)).length

  const [
    total,
    solved,
    deactive,
    monthlyRaw,
    yearlyRaw,
    courtDist,
  ] = await Promise.all([
    prisma.case.count(),
    prisma.case.count({ where: { status: "completed" } }),
    prisma.case.count({ where: { status: { in: ["deactive", "failed"] } } }),
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

  const running = activeCases.filter(
    (c) =>
      c.nextDate &&
      c.nextDate >= start &&
      c.nextDate <= end
  ).length

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: monthlyRaw.find((m) => m.month === i + 1)?.count ?? 0,
  }))

  return {
    totalCases: total,
    solvedCases: solved,
    deactiveCases: deactive,
    pendingCases: runningActiveCount,
    runningCasesThisWeek: running,
    monthlyCases: monthly,
    yearlyCases: yearlyRaw,
    courtDistribution: courtDist,
  }
}

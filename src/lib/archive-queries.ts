import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function listArchives() {
  await requireAdmin()
  return prisma.archive.findMany({
    where: { tableName: { not: CMS_TABLES.Case } },
    orderBy: { createdAt: "desc" },
  })
}

export async function listLawyerArchives() {
  await requireAdmin()
  return prisma.archive.findMany({
    where: { tableName: CMS_TABLES.Case },
    orderBy: { createdAt: "desc" },
  })
}

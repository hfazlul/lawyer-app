import { prisma } from "@/lib/prisma"
import { restoreArchivedRecord, CMS_TABLES } from "@/lib/cms-tables"

async function syncCaseSequences() {
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"Case"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "Case"))`
    )
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"CaseHistory"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "CaseHistory"))`
    )
  } catch {
    // Non-fatal — restore already succeeded
  }
}

export async function restoreArchiveById(archiveId: number) {
  const archive = await prisma.archive.findUnique({ where: { id: archiveId } })
  if (!archive) throw new Error("Archive not found")

  await restoreArchivedRecord(archive.tableName, archive.data as Record<string, unknown>)

  if (archive.tableName === CMS_TABLES.Case) {
    await syncCaseSequences()
  }

  await prisma.archive.delete({ where: { id: archiveId } })
  return archive
}

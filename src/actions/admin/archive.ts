"use server"

import { prisma } from "@/lib/prisma"
import { ARCHIVE_RETENTION_DAYS } from "@/lib/constants"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { restoreArchivedRecord } from "@/lib/cms-tables"
import { revalidatePublicSite } from "@/lib/cms-helpers"

function archiveExpiryDate() {
  return new Date(Date.now() + ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000)
}

export async function archiveContent(tableName: string, recordId: number, data: unknown) {
  await prisma.archive.create({
    data: {
      tableName,
      recordId,
      data: data as object,
      autoDeleteAt: archiveExpiryDate(),
    },
  })
}

export async function listArchives() {
  await requireAdmin()
  return prisma.archive.findMany({ orderBy: { createdAt: "desc" } })
}

export async function restoreFromArchive(csrfToken: string, archiveId: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const archive = await prisma.archive.findUnique({ where: { id: archiveId } })
  if (!archive) throw new Error("Archive not found")

  const data = archive.data as Record<string, unknown>
  await restoreArchivedRecord(archive.tableName, data)
  await prisma.archive.delete({ where: { id: archiveId } })
  await auditLog("archive_restore", `Restored ${archive.tableName} #${archive.recordId}`, ip)
  revalidatePublicSite()
  return { success: true }
}

export async function permanentDeleteArchive(csrfToken: string, archiveId: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const archive = await prisma.archive.findUnique({ where: { id: archiveId } })
  if (!archive) throw new Error("Archive not found")
  await prisma.archive.delete({ where: { id: archiveId } })
  await auditLog("archive_delete", `Permanently deleted ${archive.tableName} #${archive.recordId}`, ip)
  return { success: true }
}

export async function purgeExpiredArchives() {
  const result = await prisma.archive.deleteMany({
    where: { autoDeleteAt: { lte: new Date() } },
  })
  return { deleted: result.count }
}

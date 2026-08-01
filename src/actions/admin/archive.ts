"use server"

import { prisma } from "@/lib/prisma"
import { archiveExpiryDate, serializeArchivePayload } from "@/lib/archive-payload"

export async function archiveContent(tableName: string, recordId: number, data: unknown) {
  await prisma.archive.create({
    data: {
      tableName,
      recordId,
      data: serializeArchivePayload(data),
      autoDeleteAt: archiveExpiryDate(),
    },
  })
}

export async function purgeExpiredArchives() {
  const result = await prisma.archive.deleteMany({
    where: { autoDeleteAt: { lte: new Date() } },
  })
  return { deleted: result.count }
}

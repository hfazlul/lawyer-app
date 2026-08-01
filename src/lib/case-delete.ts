import { prisma } from "@/lib/prisma"
import { CMS_TABLES } from "@/lib/cms-tables"
import { archiveExpiryDate, serializeArchivePayload } from "@/lib/archive-payload"

export async function deleteCaseRecord(id: number) {
  const existing = await prisma.case.findUnique({
    where: { id },
    include: { history: { orderBy: { date: "asc" } } },
  })
  if (!existing) throw new Error("Case not found")

  const { history, ...caseData } = existing
  const payload = serializeArchivePayload({ case: caseData, history })

  await prisma.$transaction(async (tx) => {
    await tx.archive.create({
      data: {
        tableName: CMS_TABLES.Case,
        recordId: id,
        data: payload,
        autoDeleteAt: archiveExpiryDate(),
      },
    })
    await tx.caseHistory.deleteMany({ where: { caseId: id } })
    await tx.case.delete({ where: { id } })
  })
}

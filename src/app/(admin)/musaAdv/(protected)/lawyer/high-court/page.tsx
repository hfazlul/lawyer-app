import { prisma } from "@/lib/prisma"
import { CaseTable } from "@/components/dashboard/case-table"
import { autoCompleteStaleActiveCases } from "@/actions/admin/case-actions"

export const dynamic = "force-dynamic"

export default async function Page() {
  await autoCompleteStaleActiveCases()

  const cases = await prisma.case.findMany({
    where: { court: "HIGH_COURT", status: "active" },
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">High Court Cases</h1>
      <CaseTable
        cases={cases}
        title="High Court Cases"
        defaultCourt="HIGH_COURT"
        searchable
        listMode="active"
      />
    </div>
  )
}

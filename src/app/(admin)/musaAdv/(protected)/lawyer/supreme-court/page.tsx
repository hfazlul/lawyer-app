import { prisma } from "@/lib/prisma"
import { CaseTable } from "@/components/dashboard/case-table"
import { autoCompleteStaleActiveCases } from "@/actions/admin/case-actions"

export const dynamic = "force-dynamic"

export default async function Page() {
  await autoCompleteStaleActiveCases()

  const cases = await prisma.case.findMany({
    where: { court: "SUPREME_COURT", status: "active" },
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Supreme Court Cases</h1>
      <CaseTable
        cases={cases}
        title="Supreme Court Cases"
        defaultCourt="SUPREME_COURT"
        searchable
        listMode="active"
      />
    </div>
  )
}

import { prisma } from "@/lib/prisma"
import { CaseTable } from "@/components/dashboard/case-table"

export default async function ClientsPage() {
  const cases = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Clients / Cases</h1>
      <CaseTable
        cases={cases}
        title="All Clients / Cases"
        showCourtColumn
        historyPhoneFilter
        searchable
      />
    </div>
  )
}

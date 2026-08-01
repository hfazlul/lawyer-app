import { prisma } from "@/lib/prisma"
import { CaseTable } from "@/components/dashboard/case-table"

export const dynamic = "force-dynamic"

export default async function Page() {
  const cases = await prisma.case.findMany({
    where: { court: "SUPREME_COURT" },
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Supreme Court Cases</h1>
      <CaseTable cases={cases} title="Supreme Court Cases" defaultCourt="SUPREME_COURT" searchable />
    </div>
  )
}

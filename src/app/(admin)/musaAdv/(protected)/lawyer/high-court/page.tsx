import { prisma } from "@/lib/prisma"
import { CaseTable } from "@/components/dashboard/case-table"

export const dynamic = "force-dynamic"

export default async function Page() {
  const cases = await prisma.case.findMany({
    where: { court: "HIGH_COURT" },
    orderBy: { updatedAt: "desc" },
  })
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">High Court Cases</h1>
      <CaseTable cases={cases} title="High Court Cases" defaultCourt="HIGH_COURT" searchable />
    </div>
  )
}

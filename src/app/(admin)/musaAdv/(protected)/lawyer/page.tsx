import { prisma } from "@/lib/prisma"
import { LawyerOverviewTabs } from "@/components/dashboard/lawyer-overview-tabs"

export const dynamic = "force-dynamic"

export default async function LawyerOverviewPage() {
  const cases = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Overview</h1>
      <LawyerOverviewTabs cases={cases} />
    </div>
  )
}

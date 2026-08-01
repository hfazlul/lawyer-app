import { getScheduledCases } from "@/actions/admin/cause-list-actions"
import { CauseListTabs } from "@/components/dashboard/cause-list-tabs"

export const dynamic = "force-dynamic"

export default async function CauseListPage() {
  const cases = await getScheduledCases()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Cause List</h1>
      <CauseListTabs cases={cases} />
    </div>
  )
}

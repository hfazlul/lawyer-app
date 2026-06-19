import { getTodayCases, getNextDayCases } from "@/actions/admin/cause-list-actions"
import { CauseListTabs } from "@/components/dashboard/cause-list-tabs"

export default async function CauseListPage() {
  const [todayCases, nextDayCases] = await Promise.all([getTodayCases(), getNextDayCases()])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cause List</h1>
      <CauseListTabs todayCases={todayCases} nextDayCases={nextDayCases} />
    </div>
  )
}

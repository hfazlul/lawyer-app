import { auth } from "@/lib/auth"
import { getScheduledCases } from "@/actions/admin/cause-list-actions"
import { CauseListTabs } from "@/components/dashboard/cause-list-tabs"
import { CsrfShell } from "@/components/admin/csrf-shell"
import { EmployeeHeader } from "@/components/dashboard/employee-header"
import { getEmployeeAuthRedirectPath } from "@/lib/employee-auth-redirect"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EmployeePortalPage() {
  const session = await auth()
  const role = session?.user?.role

  if (role === "employee" || role === "admin") {
    const cases = await getScheduledCases()

    return (
      <div className="cause-list-shell fixed inset-0 flex flex-col overflow-hidden bg-background">
        <EmployeeHeader />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
          <CsrfShell>
            <div>
              <h1 className="mb-6 text-2xl font-bold">Cause List</h1>
              <CauseListTabs cases={cases} readOnlyCases />
            </div>
          </CsrfShell>
        </main>
      </div>
    )
  }

  redirect(await getEmployeeAuthRedirectPath())
}

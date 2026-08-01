import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { CsrfShell } from "@/components/admin/csrf-shell"

export const dynamic = "force-dynamic"

/** Auth is enforced in middleware; keep this layout sync so the shell persists across navigations. */
export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
          <CsrfShell>{children}</CsrfShell>
        </main>
      </div>
    </div>
  )
}

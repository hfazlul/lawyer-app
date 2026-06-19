import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { CsrfShell } from "@/components/admin/csrf-shell"

export const dynamic = "force-dynamic"

/** Auth is enforced in middleware; keep this layout sync so the shell persists across navigations. */
export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <CsrfShell>{children}</CsrfShell>
        </main>
      </div>
    </div>
  )
}

import { CsrfProvider } from "@/components/admin/csrf-provider"
import { getOrSetCsrfToken } from "@/lib/csrf"

/** Async boundary for CSRF — keeps the admin shell layout sync for stable navigation. */
export async function CsrfShell({ children }: { children: React.ReactNode }) {
  const csrfToken = await getOrSetCsrfToken()
  return <CsrfProvider initialToken={csrfToken}>{children}</CsrfProvider>
}

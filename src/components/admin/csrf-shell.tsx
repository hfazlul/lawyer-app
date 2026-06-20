import { CsrfProvider } from "@/components/admin/csrf-provider"
import { getCsrfToken } from "@/lib/csrf"

/** Async boundary for CSRF — keeps the admin shell layout sync for stable navigation. */
export async function CsrfShell({ children }: { children: React.ReactNode }) {
  // Read-only in RSC; CsrfProvider fetches /api/csrf when missing (sets cookie in route handler).
  const csrfToken = await getCsrfToken()
  return <CsrfProvider initialToken={csrfToken}>{children}</CsrfProvider>
}

import { redirect } from "next/navigation"
import { getLiveAdminCount } from "@/lib/admin-auth-redirect"
import { adminPath } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function LoginGate({ children }: { children: React.ReactNode }) {
  const adminCount = await getLiveAdminCount()
  if (adminCount === 0) redirect(adminPath("signup"))
  return <>{children}</>
}

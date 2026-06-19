import "server-only"
import { headers } from "next/headers"
import { requireAdmin } from "@/lib/session"
import { verifyCsrfToken } from "@/lib/csrf"
import type { AdminSessionUser } from "@/types"

export async function getClientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown"
  )
}

export async function requireAdminMutation(
  csrfToken: string | null | undefined
): Promise<{ admin: AdminSessionUser; ip: string }> {
  const admin = await requireAdmin()
  const valid = await verifyCsrfToken(csrfToken)
  if (!valid) throw new Error("Invalid CSRF token")
  const ip = await getClientIp()
  return { admin, ip }
}

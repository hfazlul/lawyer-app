import { auth } from "@/lib/auth"
import { getAdminAuthRedirectPath } from "@/lib/admin-auth-redirect"
import { adminPath, employeePath } from "@/lib/constants"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminIndex() {
  const session = await auth()
  if (session?.user?.role === "admin") redirect(adminPath("dashboard"))
  if (session?.user?.role === "employee") redirect(employeePath())
  redirect(await getAdminAuthRedirectPath())
}

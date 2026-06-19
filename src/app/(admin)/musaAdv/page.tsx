import { auth } from "@/lib/auth"
import { getAdminAuthRedirectPath } from "@/lib/admin-auth-redirect"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminIndex() {
  const session = await auth()
  if (session?.user?.role === "admin") redirect("/musaAdv/dashboard")
  redirect(await getAdminAuthRedirectPath())
}

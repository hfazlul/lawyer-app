import { auth } from "./auth"
import type { AdminSessionUser } from "@/types"

export async function getAdminSession() {
  const session = await auth()
  if (!session?.user || (session.user as AdminSessionUser).role !== "admin") {
    return null
  }
  return session.user as AdminSessionUser
}

export async function requireAdmin(): Promise<AdminSessionUser> {
  const user = await getAdminSession()
  if (!user) throw new Error("Unauthorized")
  return user
}

import { auth } from "./auth"
import type { AdminRole, AdminSessionUser } from "@/types"

function isRole(user: AdminSessionUser | undefined, role: AdminRole) {
  return user?.role === role
}

export async function getSessionUser() {
  const session = await auth()
  if (!session?.user) return null
  return session.user as AdminSessionUser
}

export async function getAdminSession() {
  const user = await getSessionUser()
  if (!user || !isRole(user, "admin")) return null
  return user
}

export async function getEmployeeSession() {
  const user = await getSessionUser()
  if (!user || !isRole(user, "employee")) return null
  return user
}

export async function getCauseListSession() {
  const user = await getSessionUser()
  if (!user || (user.role !== "admin" && user.role !== "employee")) return null
  return user
}

export async function requireAdmin(): Promise<AdminSessionUser> {
  const user = await getAdminSession()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function requireCauseListViewer(): Promise<AdminSessionUser> {
  const user = await getCauseListSession()
  if (!user) throw new Error("Unauthorized")
  return user
}

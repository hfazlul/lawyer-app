import type { AdminAccountRole } from "@prisma/client"
import type { AdminRole } from "@/types"

export function dbRoleToSessionRole(role: AdminAccountRole): AdminRole {
  return role === "EMPLOYEE" ? "employee" : "admin"
}

import { unstable_noStore as noStore } from "next/cache"
import { employeePath } from "./constants"
import { prisma } from "./prisma"

/** Live DB count — use for auth routing (signup/login gates). */
export async function getLiveEmployeeCount(): Promise<number> {
  noStore()
  return prisma.admin.count({ where: { role: "EMPLOYEE" } })
}

export async function getEmployeeAuthRedirectPath(): Promise<string> {
  const employeeCount = await getLiveEmployeeCount()
  return employeeCount === 0 ? employeePath("signup") : employeePath("login")
}

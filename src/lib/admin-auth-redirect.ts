import { unstable_noStore as noStore } from "next/cache"
import { prisma } from "./prisma"

/** Live DB count — use for auth routing (signup/login gates). */
export async function getLiveAdminCount(): Promise<number> {
  noStore()
  return prisma.admin.count()
}

export async function getAdminAuthRedirectPath(): Promise<"/musaAdv/signup" | "/musaAdv/login"> {
  const adminCount = await getLiveAdminCount()
  return adminCount === 0 ? "/musaAdv/signup" : "/musaAdv/login"
}

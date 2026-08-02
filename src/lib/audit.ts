import { prisma } from "./prisma"
import { getSessionUser } from "./session"

export async function auditLog(action: string, details?: string, ip?: string) {
  const user = await getSessionUser()
  await prisma.auditLog.create({
    data: {
      adminId: user?.id ?? "system",
      action,
      details,
      ip,
    },
  })
}

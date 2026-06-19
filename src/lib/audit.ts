import { prisma } from "./prisma"
import { getAdminSession } from "./session"

export async function auditLog(action: string, details?: string, ip?: string) {
  const admin = await getAdminSession()
  await prisma.auditLog.create({
    data: {
      adminId: admin?.id ?? "system",
      action,
      details,
      ip,
    },
  })
}

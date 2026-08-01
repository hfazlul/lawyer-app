import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { adminPath } from "@/lib/constants"
import { getAdminSession } from "@/lib/session"
import { auditLog } from "@/lib/audit"
import { getClientIp } from "@/lib/admin-mutation"

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await prisma.archive.deleteMany({})
    const ip = await getClientIp()
    await auditLog("archive_delete_all", `Permanently deleted ${result.count} archives`, ip)
    revalidatePath(adminPath("client-site/archive"))
    revalidatePath(adminPath("lawyer/archive"))
    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

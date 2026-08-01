import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { adminPath } from "@/lib/constants"
import { getAdminSession } from "@/lib/session"
import { auditLog } from "@/lib/audit"
import { getClientIp } from "@/lib/admin-mutation"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idParam } = await params
  const archiveId = Number(idParam)
  if (!Number.isInteger(archiveId) || archiveId <= 0) {
    return NextResponse.json({ error: "Invalid archive id" }, { status: 400 })
  }

  try {
    const archive = await prisma.archive.findUnique({ where: { id: archiveId } })
    if (!archive) throw new Error("Archive not found")

    await prisma.archive.delete({ where: { id: archiveId } })
    const ip = await getClientIp()
    await auditLog("archive_delete", `Permanently deleted ${archive.tableName} #${archive.recordId}`, ip)

    revalidatePath(adminPath("client-site/archive"))
    revalidatePath(adminPath("lawyer/archive"))

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

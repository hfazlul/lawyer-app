import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { deleteCaseRecord } from "@/lib/case-delete"
import { adminPath } from "@/lib/constants"
import { CASE_REVALIDATE_PATHS } from "@/lib/case-helpers"
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
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid case id" }, { status: 400 })
  }

  try {
    await deleteCaseRecord(id)
    const ip = await getClientIp()
    await auditLog("case_delete", `Deleted case ${id}`, ip)

    for (const path of CASE_REVALIDATE_PATHS) {
      revalidatePath(path)
    }
    revalidatePath(adminPath("lawyer/archive"))

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

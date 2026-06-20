import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { deleteBackup } from "@/actions/admin/backup-actions"
import { adminPath } from "@/lib/constants"
import { getAdminSession } from "@/lib/session"
import { verifyCsrfToken } from "@/lib/csrf"

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const csrf = req.headers.get("x-csrf-token")
  if (!(await verifyCsrfToken(csrf))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  }

  const file = req.nextUrl.searchParams.get("file")
  if (!file) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 })
  }

  try {
    await deleteBackup(csrf!, file)
    revalidatePath(adminPath("system/backup"))
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

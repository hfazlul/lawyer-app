import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { restoreArchiveById } from "@/lib/restore-archive"
import { adminPath } from "@/lib/constants"
import { CASE_REVALIDATE_PATHS } from "@/lib/case-helpers"
import { getAdminSession } from "@/lib/session"
import { auditLog } from "@/lib/audit"
import { getClientIp } from "@/lib/admin-mutation"
import { CMS_TABLES } from "@/lib/cms-tables"
import { revalidatePublicSite } from "@/lib/cms-helpers"

export async function POST(
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
    const archive = await restoreArchiveById(archiveId)
    const ip = await getClientIp()
    await auditLog("archive_restore", `Restored ${archive.tableName} #${archive.recordId}`, ip)

    revalidatePublicSite()
    revalidatePath(adminPath("dashboard"))
    revalidatePath(adminPath("client-site/archive"))
    revalidatePath(adminPath("lawyer/archive"))

    if (archive.tableName === CMS_TABLES.Case) {
      for (const path of CASE_REVALIDATE_PATHS) {
        revalidatePath(path)
      }
    }

    const caseCourt =
      archive.tableName === CMS_TABLES.Case
        ? ((archive.data as { case?: { court?: string } })?.case?.court ?? null)
        : null

    return NextResponse.json({ success: true, court: caseCourt })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Restore failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

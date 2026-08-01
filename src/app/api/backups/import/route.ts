import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"
import { auditLog } from "@/lib/audit"
import { extractBackupZip, restoreFromExtractedBackup } from "@/lib/backup-archive"
import { revalidatePublicSite } from "@/lib/cms-helpers"
import { CASE_REVALIDATE_PATHS } from "@/lib/case-helpers"
import { adminPath } from "@/lib/constants"
import { verifyCsrfToken } from "@/lib/csrf"
import { getAdminSession } from "@/lib/session"

const BACKUP_DIR = path.join(process.cwd(), "backups")
const MAX_IMPORT_BYTES = 250 * 1024 * 1024

export const maxDuration = 300

function revalidateAfterRestore() {
  revalidatePublicSite()
  revalidatePath(adminPath("dashboard"))
  revalidatePath(adminPath("system/backup"))
  revalidatePath(adminPath("client-site/archive"))
  revalidatePath(adminPath("lawyer/archive"))
  for (const route of CASE_REVALIDATE_PATHS) {
    revalidatePath(route)
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const csrf = req.headers.get("x-csrf-token")
  if (!(await verifyCsrfToken(csrf))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("backup")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No backup file selected" }, { status: 400 })
  }
  if (!file.name.toLowerCase().endsWith(".zip")) {
    return NextResponse.json({ error: "Backup file must be a .zip archive" }, { status: 400 })
  }
  if (file.size > MAX_IMPORT_BYTES) {
    return NextResponse.json({ error: "Backup file is too large (max 250 MB)" }, { status: 400 })
  }

  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })

    const ts = new Date().toISOString().replace(/[:.]/g, "-")
    const savedName = `backup-${ts}.zip`
    const savedPath = path.join(BACKUP_DIR, savedName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.promises.writeFile(savedPath, buffer)

    const extractDir = path.join(BACKUP_DIR, `temp_import_${Date.now()}`)
    try {
      const extracted = await extractBackupZip(savedPath, extractDir)
      await restoreFromExtractedBackup(extracted)
    } finally {
      await fs.promises.rm(extractDir, { recursive: true, force: true }).catch(() => {})
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      undefined
    await auditLog("import_backup", `Imported and restored ${savedName}`, ip)
    revalidateAfterRestore()

    return NextResponse.json({ success: true, fileName: savedName })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

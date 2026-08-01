"use server"

import "server-only"
import fs from "fs"
import path from "path"
import { revalidatePath } from "next/cache"
import { auditLog } from "@/lib/audit"
import { requireAdminMutation } from "@/lib/admin-mutation"
import {
  createBackupZip,
  extractBackupZip,
  restoreFromExtractedBackup,
} from "@/lib/backup-archive"
import { exportDatabaseTables } from "@/lib/database-backup"
import { revalidatePublicSite } from "@/lib/cms-helpers"
import { CASE_REVALIDATE_PATHS } from "@/lib/case-helpers"
import { adminPath } from "@/lib/constants"
import { requireAdmin } from "@/lib/session"

const BACKUP_DIR = path.join(process.cwd(), "backups")

function assertValidBackupName(fileName: string): string {
  if (!/^backup-[\dT-Za-z-]+\.zip$/.test(fileName)) {
    throw new Error("Invalid backup file name")
  }
  return fileName
}

function resolveBackupPath(fileName: string): string {
  const safe = assertValidBackupName(fileName)
  const resolved = path.resolve(BACKUP_DIR, safe)
  if (!resolved.startsWith(path.resolve(BACKUP_DIR))) {
    throw new Error("Invalid path")
  }
  return resolved
}

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

export async function backupDatabase(csrfToken: string) {
  const { ip } = await requireAdminMutation(csrfToken)
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })

  const payload = await exportDatabaseTables()
  const zipPath = await createBackupZip(BACKUP_DIR, `backup-${ts}.zip`, payload)

  await auditLog("create_backup", `Created ${path.basename(zipPath)}`, ip)
  return zipPath
}

export async function listBackups() {
  await requireAdmin()
  if (!fs.existsSync(BACKUP_DIR)) return []
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".zip"))
    .map((f) => ({
      name: f,
      size: fs.statSync(path.join(BACKUP_DIR, f)).size,
      createdAt: fs.statSync(path.join(BACKUP_DIR, f)).mtime.toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function deleteBackup(csrfToken: string, fileName: string) {
  const { ip } = await requireAdminMutation(csrfToken)
  const zipPath = resolveBackupPath(fileName)
  if (!fs.existsSync(zipPath)) throw new Error("Not found")
  fs.unlinkSync(zipPath)
  await auditLog("delete_backup", `Deleted ${fileName}`, ip)
  return { success: true }
}

export async function getBackupFilePath(fileName: string): Promise<string> {
  await requireAdmin()
  const zipPath = resolveBackupPath(fileName)
  if (!fs.existsSync(zipPath)) throw new Error("Not found")
  return zipPath
}

export async function restoreBackup(csrfToken: string, fileName: string) {
  const { ip } = await requireAdminMutation(csrfToken)
  const zipPath = resolveBackupPath(fileName)
  if (!fs.existsSync(zipPath)) throw new Error("Not found")

  const extractDir = path.join(BACKUP_DIR, `temp_extract_${Date.now()}`)
  try {
    const extracted = await extractBackupZip(zipPath, extractDir)
    await restoreFromExtractedBackup(extracted)
  } finally {
    await fs.promises.rm(extractDir, { recursive: true, force: true }).catch(() => {})
  }

  await auditLog("restore_backup", `Restored from ${fileName}`, ip)
  revalidateAfterRestore()
  return { success: true }
}

"use server"

import "server-only"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"
import { auditLog } from "@/lib/audit"
import { requireAdminMutation } from "@/lib/admin-mutation"
import {
  assertPostgresToolExists,
  postgresToolNotFoundMessage,
  resolvePostgresTool,
  type PostgresTool,
} from "@/lib/postgres-bin"
import { requireAdmin } from "@/lib/session"

const BACKUP_DIR = path.join(process.cwd(), "backups")

function assertValidBackupName(fileName: string): string {
  if (!/^backup-[\dT-]+\.zip$/.test(fileName)) {
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

function parseDbUrl(dbUrl: string) {
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/)
  if (!match) throw new Error("Invalid DATABASE_URL")
  const [, user, password, host, port, db] = match
  return { user, password, host, port, db }
}

function runCommand(
  tool: PostgresTool,
  args: string[],
  extraEnv: Record<string, string> = {}
): Promise<void> {
  const executable = resolvePostgresTool(tool)
  assertPostgresToolExists(executable, tool)

  return new Promise((resolve, reject) => {
    const proc = spawn(executable, args, {
      env: { ...process.env, ...extraEnv },
      windowsHide: true,
    })
    let stderr = ""
    proc.stderr?.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    proc.on("error", (err) => {
      reject(new Error(postgresToolNotFoundMessage(tool, err.message)))
    })
    proc.on("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(stderr.trim() || `${tool} exited with code ${code}`))
    })
  })
}

async function pgDump(outputFile: string) {
  const dbUrl = process.env.DATABASE_URL!
  const { user, password, host, port, db } = parseDbUrl(dbUrl)
  await runCommand("pg_dump", ["-U", user, "-h", host, "-p", port, "-d", db, "-f", outputFile], {
    PGPASSWORD: password,
  })
}

async function psqlRestore(sqlFile: string) {
  const dbUrl = process.env.DATABASE_URL!
  const { user, password, host, port, db } = parseDbUrl(dbUrl)
  await runCommand("psql", ["-U", user, "-h", host, "-p", port, "-d", db, "-f", sqlFile], {
    PGPASSWORD: password,
  })
}

export async function backupDatabase(csrfToken: string) {
  const { ip } = await requireAdminMutation(csrfToken)
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const dumpFile = path.join(BACKUP_DIR, `dump-${ts}.sql`)
  await pgDump(dumpFile)

  const archiver = (await import("archiver")).default
  const archive = archiver("zip", { zlib: { level: 9 } })
  const zipPath = path.join(BACKUP_DIR, `backup-${ts}.zip`)
  const output = fs.createWriteStream(zipPath)

  return new Promise<string>((resolve, reject) => {
    output.on("close", async () => {
      try {
        if (fs.existsSync(dumpFile)) fs.unlinkSync(dumpFile)
        await auditLog("create_backup", `Created ${path.basename(zipPath)}`, ip)
      } catch {
        /* non-fatal */
      }
      resolve(zipPath)
    })
    archive.on("error", reject)
    archive.pipe(output)
    archive.file(dumpFile, { name: "database.sql" })
    const uploadsDir = path.join(process.cwd(), "public/uploads")
    if (fs.existsSync(uploadsDir)) archive.directory(uploadsDir, "uploads")
    archive.finalize()
  })
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
  const unzipper = (await import("unzipper")) as unknown as {
    Extract: (options: { path: string }) => NodeJS.WritableStream
  }
  const extractDir = path.join(BACKUP_DIR, "temp_extract")
  await fs.promises.mkdir(extractDir, { recursive: true })
  await new Promise<void>((resolve, reject) => {
    fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .on("close", resolve)
      .on("error", reject)
  })
  const sqlFile = path.join(extractDir, "database.sql")
  if (fs.existsSync(sqlFile)) {
    await psqlRestore(sqlFile)
  }
  const uploadsSrc = path.join(extractDir, "uploads")
  const uploadsDest = path.join(process.cwd(), "public/uploads")
  if (fs.existsSync(uploadsSrc)) fs.cpSync(uploadsSrc, uploadsDest, { recursive: true })
  fs.rmSync(extractDir, { recursive: true, force: true })
  await auditLog("restore_backup", `Restored from ${fileName}`, ip)
  return { success: true }
}

import fs from "fs"
import path from "path"
import { spawn } from "child_process"
import archiver from "archiver"
import { importDatabaseTables, type DatabaseBackupPayload } from "@/lib/database-backup"
import {
  assertPostgresToolExists,
  postgresToolNotFoundMessage,
  resolvePostgresTool,
  type PostgresTool,
} from "@/lib/postgres-bin"

const UPLOADS_DIR = path.join(process.cwd(), "public/uploads")

export async function createBackupZip(
  backupDir: string,
  zipFileName: string,
  payload: DatabaseBackupPayload
): Promise<string> {
  const jsonPath = path.join(backupDir, `data-${Date.now()}.json`)
  await fs.promises.writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8")

  const zipPath = path.join(backupDir, zipFileName)
  const archive = archiver("zip", { zlib: { level: 9 } })
  const output = fs.createWriteStream(zipPath)

  await new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve())
    archive.on("error", reject)
    archive.pipe(output)
    archive.file(jsonPath, { name: "data.json" })
    if (fs.existsSync(UPLOADS_DIR)) {
      archive.directory(UPLOADS_DIR, "uploads")
    }
    archive.finalize()
  })

  await fs.promises.unlink(jsonPath).catch(() => {})
  return zipPath
}

export type ExtractedBackup = {
  data: DatabaseBackupPayload | null
  sqlFile: string | null
  uploadsDir: string | null
}

export async function extractBackupZip(zipPath: string, extractDir: string): Promise<ExtractedBackup> {
  const unzipper = (await import("unzipper")) as unknown as {
    Extract: (options: { path: string }) => NodeJS.WritableStream
  }

  await fs.promises.mkdir(extractDir, { recursive: true })
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .on("close", resolve)
      .on("error", reject)
  })

  const dataJsonPath = path.join(extractDir, "data.json")
  const sqlFilePath = path.join(extractDir, "database.sql")
  const uploadsDir = path.join(extractDir, "uploads")

  let data: DatabaseBackupPayload | null = null
  if (fs.existsSync(dataJsonPath)) {
    const raw = await fs.promises.readFile(dataJsonPath, "utf8")
    data = JSON.parse(raw) as DatabaseBackupPayload
  }

  return {
    data,
    sqlFile: fs.existsSync(sqlFilePath) ? sqlFilePath : null,
    uploadsDir: fs.existsSync(uploadsDir) ? uploadsDir : null,
  }
}

export async function restoreUploadsFromDir(uploadsSrc: string) {
  if (fs.existsSync(UPLOADS_DIR)) {
    await fs.promises.rm(UPLOADS_DIR, { recursive: true, force: true })
  }
  await fs.promises.mkdir(path.dirname(UPLOADS_DIR), { recursive: true })
  await fs.promises.cp(uploadsSrc, UPLOADS_DIR, { recursive: true })
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

async function psqlRestore(sqlFile: string) {
  const dbUrl = process.env.DATABASE_URL!
  const { user, password, host, port, db } = parseDbUrl(dbUrl)
  await runCommand("psql", ["-U", user, "-h", host, "-p", port, "-d", db, "-f", sqlFile], {
    PGPASSWORD: password,
  })
}

export async function restoreFromExtractedBackup(extracted: ExtractedBackup) {
  if (extracted.data) {
    await importDatabaseTables(extracted.data)
  } else if (extracted.sqlFile) {
    await psqlRestore(extracted.sqlFile)
  } else {
    throw new Error("Backup file does not contain data.json or database.sql")
  }

  if (extracted.uploadsDir) {
    await restoreUploadsFromDir(extracted.uploadsDir)
  }
}

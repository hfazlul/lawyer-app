import { execFileSync } from "child_process"
import fs from "fs"
import path from "path"

export type PostgresTool = "pg_dump" | "psql" | "pg_restore"

const TOOL_ENV_KEYS: Record<PostgresTool, string> = {
  pg_dump: "PG_DUMP_PATH",
  psql: "PG_PSQL_PATH",
  pg_restore: "PG_RESTORE_PATH",
}

const PROGRAM_FILES_PG_VERSIONS = [18, 17, 16, 15, 14, 13, 12] as const

let cachedBinDirs: string[] | null = null

function executableName(tool: PostgresTool): string {
  return process.platform === "win32" ? `${tool}.exe` : tool
}

function readWindowsRegistryBinDirs(): string[] {
  if (process.platform !== "win32") return []
  try {
    const output = execFileSync(
      "reg",
      ["query", "HKLM\\SOFTWARE\\PostgreSQL\\Installations", "/s", "/v", "Base Directory"],
      { encoding: "utf8", windowsHide: true }
    )
    const dirs: string[] = []
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/Base Directory\s+REG_\w+\s+(.+)$/)
      if (!match) continue
      const baseDir = match[1].trim()
      dirs.push(path.join(baseDir, "bin"))
    }
    return dirs
  } catch {
    return []
  }
}

function getCandidateBinDirs(): string[] {
  if (cachedBinDirs) return cachedBinDirs

  const dirs: string[] = []

  const pgBinDir = process.env.PG_BIN_DIR?.trim()
  if (pgBinDir) dirs.push(pgBinDir)

  if (process.platform === "win32") {
    dirs.push(...readWindowsRegistryBinDirs())

    const programFiles = process.env["ProgramFiles"] ?? "C:\\Program Files"
    const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)"
    for (const root of [programFiles, programFilesX86]) {
      for (const version of PROGRAM_FILES_PG_VERSIONS) {
        dirs.push(path.join(root, "PostgreSQL", String(version), "bin"))
      }
    }
  }

  cachedBinDirs = Array.from(new Set(dirs.map((d) => path.normalize(d))))
  return cachedBinDirs
}

function resolveFromCandidates(tool: PostgresTool): string | null {
  const name = executableName(tool)
  for (const dir of getCandidateBinDirs()) {
    const full = path.join(dir, name)
    if (fs.existsSync(full)) return full
  }
  return null
}

export function resolvePostgresTool(tool: PostgresTool): string {
  const toolEnv = process.env[TOOL_ENV_KEYS[tool]]?.trim()
  if (toolEnv) {
    if (fs.existsSync(toolEnv)) return toolEnv
    throw new Error(postgresToolNotFoundMessage(tool, `PG path does not exist: ${toolEnv}`))
  }

  const fromCandidates = resolveFromCandidates(tool)
  if (fromCandidates) return fromCandidates

  const pgBinDir = process.env.PG_BIN_DIR?.trim()
  if (pgBinDir) {
    const full = path.join(pgBinDir, executableName(tool))
    if (fs.existsSync(full)) return full
    throw new Error(
      postgresToolNotFoundMessage(tool, `No ${executableName(tool)} in PG_BIN_DIR (${pgBinDir})`)
    )
  }

  return executableName(tool)
}

export function postgresToolNotFoundMessage(tool: PostgresTool, detail?: string): string {
  const hint =
    process.platform === "win32"
      ? "Set PG_BIN_DIR to your PostgreSQL bin folder (e.g. D:\\FAZLUL\\Others\\PostgreSQL\\bin) " +
        `or ${TOOL_ENV_KEYS[tool]} to the full path of ${executableName(tool)}.`
      : "Install PostgreSQL client tools and add them to PATH, or set PG_BIN_DIR."

  const base = `PostgreSQL tool '${tool}' not found. ${hint}`
  return detail ? `${base} (${detail})` : base
}

export function assertPostgresToolExists(executable: string, tool: PostgresTool): void {
  if (!executable.includes(path.sep) && !executable.includes("/")) return
  if (!fs.existsSync(executable)) {
    throw new Error(postgresToolNotFoundMessage(tool, `Expected at ${executable}`))
  }
}

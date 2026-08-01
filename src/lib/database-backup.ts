import { prisma } from "@/lib/prisma"
import type { PrismaClient } from "@prisma/client"

export const BACKUP_FORMAT_VERSION = 1

export const BACKUP_TABLE_ORDER = [
  "Admin",
  "SiteSetting",
  "NavItem",
  "HeroSlide",
  "HomeIntro",
  "FeaturedService",
  "SuccessStat",
  "Activity",
  "Testimonial",
  "ServicePage",
  "ServicesSetting",
  "AppointmentSetting",
  "ContactSetting",
  "AboutPage",
  "AppointmentMessage",
  "ContactMessage",
  "Archive",
  "AuditLog",
  "Case",
  "CaseHistory",
] as const

export type BackupTableName = (typeof BACKUP_TABLE_ORDER)[number]

export type DatabaseBackupPayload = {
  version: number
  exportedAt: string
  tables: Partial<Record<BackupTableName, unknown[]>>
}

type DbClient = PrismaClient | Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type ModelDelegate = {
  findMany: () => Promise<unknown[]>
  deleteMany: () => Promise<unknown>
  createMany: (args: { data: unknown[] }) => Promise<{ count: number }>
}

function modelDelegateName(model: BackupTableName): string {
  return model.charAt(0).toLowerCase() + model.slice(1)
}

function getDelegate(client: DbClient, model: BackupTableName): ModelDelegate {
  const delegate = (client as unknown as Record<string, ModelDelegate>)[modelDelegateName(model)]
  if (!delegate) {
    throw new Error(`Unknown backup model: ${model}`)
  }
  return delegate
}

const AUTO_INCREMENT_TABLES: BackupTableName[] = [
  "NavItem",
  "HeroSlide",
  "FeaturedService",
  "SuccessStat",
  "Activity",
  "Testimonial",
  "ServicePage",
  "AppointmentMessage",
  "ContactMessage",
  "Archive",
  "AuditLog",
  "Case",
  "CaseHistory",
]

export async function exportDatabaseTables(): Promise<DatabaseBackupPayload> {
  const tables: Partial<Record<BackupTableName, unknown[]>> = {}

  for (const model of BACKUP_TABLE_ORDER) {
    tables[model] = await getDelegate(prisma, model).findMany()
  }

  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
  }
}

export function parseDatabaseBackup(raw: unknown): DatabaseBackupPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid backup file: expected JSON object")
  }

  const payload = raw as DatabaseBackupPayload
  if (payload.version !== BACKUP_FORMAT_VERSION) {
    throw new Error(`Unsupported backup version: ${payload.version ?? "unknown"}`)
  }
  if (!payload.tables || typeof payload.tables !== "object") {
    throw new Error("Invalid backup file: missing tables")
  }

  return payload
}

async function resetAutoIncrementSequences() {
  for (const table of AUTO_INCREMENT_TABLES) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), true);`
    )
  }
}

export async function importDatabaseTables(payload: DatabaseBackupPayload) {
  const parsed = parseDatabaseBackup(payload)

  await prisma.$transaction(
    async (tx) => {
      for (const model of [...BACKUP_TABLE_ORDER].reverse()) {
        await getDelegate(tx, model).deleteMany()
      }

      for (const model of BACKUP_TABLE_ORDER) {
        const rows = parsed.tables[model] ?? []
        if (rows.length === 0) continue
        await getDelegate(tx, model).createMany({ data: rows })
      }
    },
    { timeout: 120_000 }
  )

  await resetAutoIncrementSequences()
}

export function getBackupTableCounts(payload: DatabaseBackupPayload): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const model of BACKUP_TABLE_ORDER) {
    counts[model] = payload.tables[model]?.length ?? 0
  }
  return counts
}

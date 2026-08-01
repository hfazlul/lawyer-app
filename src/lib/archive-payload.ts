import { ARCHIVE_RETENTION_DAYS } from "@/lib/constants"

export function serializeArchivePayload(data: unknown): object {
  return JSON.parse(JSON.stringify(data)) as object
}

export function archiveExpiryDate(days = ARCHIVE_RETENTION_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

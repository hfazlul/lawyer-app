import type { CourtType } from "@prisma/client"

export const CASE_REVALIDATE_PATHS = [
  "/musaAdv/lawyer/clients",
  "/musaAdv/lawyer/judge-court",
  "/musaAdv/lawyer/high-court",
  "/musaAdv/lawyer/supreme-court",
  "/musaAdv/lawyer/cause-list",
  "/musaAdv/dashboard",
] as const

export function formatCourtName(court: CourtType | string): string {
  return court
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatOnBehalf(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().split("T")[0]
}

export function datesEqual(
  a: Date | null | undefined,
  b: Date | null | undefined
): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.getTime() === b.getTime()
}

export function getGDrivePreviewUrl(url: string): string | null {
  const match = url.match(/\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  return null
}

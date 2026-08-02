import type { CourtType } from "@prisma/client"
import { adminPath, employeePath } from "@/lib/constants"

export const CASE_REVALIDATE_PATHS = [
  adminPath("lawyer"),
  adminPath("lawyer/judge-court"),
  adminPath("lawyer/high-court"),
  adminPath("lawyer/supreme-court"),
  adminPath("lawyer/cause-list"),
  adminPath("lawyer/archive"),
  adminPath("dashboard"),
  employeePath(),
] as const

export function caseCourtListPath(court: string): string {
  switch (court) {
    case "JUDGE_COURT":
      return adminPath("lawyer/judge-court")
    case "HIGH_COURT":
      return adminPath("lawyer/high-court")
    case "SUPREME_COURT":
      return adminPath("lawyer/supreme-court")
    default:
      return adminPath("lawyer")
  }
}

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

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export const STEPS_HISTORY_PREFIX = "steps::"

export function formatStepsHistoryAction(html: string) {
  return `${STEPS_HISTORY_PREFIX}${html}`
}

export function getGDrivePreviewUrl(url: string): string | null {
  const match = url.match(/\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  return null
}

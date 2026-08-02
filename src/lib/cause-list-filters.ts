import type { Case } from "@prisma/client"
import { isSameAppDay, toAppDateKey } from "@/lib/date-format"
import type { CaseStatus } from "@/types"

export function isDeactiveStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === "deactive" || normalized === "failed"
}

export function isActiveStatus(status: string) {
  return status.toLowerCase() === "active"
}

export function isCompletedStatus(status: string) {
  return status.toLowerCase() === "completed"
}

/** Next hearing is today (running day) or a future date. */
export function hasUpcomingOrTodayHearing(
  caseRecord: Case,
  refDate: Date = new Date()
): boolean {
  if (!caseRecord.nextDate) return false
  const todayKey = toAppDateKey(refDate)
  const nextKey = toAppDateKey(caseRecord.nextDate)
  return nextKey >= todayKey
}

/** Active in DB with a today/future next hearing — shown in Overview active tabs. */
export function isRunningActiveCase(caseRecord: Case, refDate: Date = new Date()): boolean {
  if (!isActiveStatus(caseRecord.status)) return false
  return hasUpcomingOrTodayHearing(caseRecord, refDate)
}

/** Active in DB but hearing date passed or missing — should be completed. */
export function isStaleActiveCase(caseRecord: Case, refDate: Date = new Date()): boolean {
  return isActiveStatus(caseRecord.status) && !hasUpcomingOrTodayHearing(caseRecord, refDate)
}

/** Completed tab: marked completed or stale active (previous cases without upcoming hearing). */
export function isOverviewCompletedCase(caseRecord: Case, refDate: Date = new Date()): boolean {
  if (isCompletedStatus(caseRecord.status)) return true
  if (isDeactiveStatus(caseRecord.status)) return false
  return isStaleActiveCase(caseRecord, refDate)
}

export function normalizeCaseStatus(status: string): CaseStatus {
  const normalized = status.toLowerCase()
  if (normalized === "completed") return "completed"
  if (isDeactiveStatus(normalized)) return "deactive"
  return "active"
}

/** Cause list: deactive cases only on previous hearing dates, others on next hearing. */
export function caseMatchesCauseListDate(caseRecord: Case, date: Date) {
  if (isDeactiveStatus(caseRecord.status)) {
    return caseRecord.previousDate && isSameAppDay(caseRecord.previousDate, date)
  }
  return caseRecord.nextDate && isSameAppDay(caseRecord.nextDate, date)
}

export function getCauseListHearingDateKey(caseRecord: Case) {
  if (isDeactiveStatus(caseRecord.status) && caseRecord.previousDate) {
    return toAppDateKey(caseRecord.previousDate)
  }
  if (caseRecord.nextDate) return toAppDateKey(caseRecord.nextDate)
  return null
}

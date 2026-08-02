import type { Case } from "@prisma/client"
import { isSameAppDay, toAppDateKey } from "@/lib/date-format"
import type { CaseStatus } from "@/types"

export function isDeactiveStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === "deactive" || normalized === "failed"
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

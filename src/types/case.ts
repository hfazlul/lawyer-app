import type { CourtType, OnBehalf } from "@prisma/client"

export type CaseStatus = "active" | "completed" | "failed"

export interface CaseFormData {
  clientName: string
  caseNo: string
  court: CourtType
  caseType: string
  onBehalf: OnBehalf
  contactNo: string
  email?: string | null
  caseFileLink?: string | null
  previousDate?: Date | null
  nextDate?: Date | null
  steps?: string | null
}

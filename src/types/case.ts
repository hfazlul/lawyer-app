import type { CourtType, OnBehalf } from "@prisma/client"

export type CaseStatus = "active" | "completed" | "deactive"

export interface CaseFormData {
  clientName: string
  caseNo: string
  court: CourtType
  courtType: string
  caseType: string
  onBehalf: OnBehalf
  contactNo: string
  email?: string | null
  caseFileLink?: string | null
  previousDate?: Date | null
  nextDate?: Date | null
  steps?: string | null
}

import { z } from "zod"

export const caseSchema = z.object({
  clientName: z.string().min(1),
  caseNo: z.string().min(1),
  court: z.enum(["JUDGE_COURT", "HIGH_COURT", "SUPREME_COURT"]),
  caseType: z.string().min(1),
  onBehalf: z.enum(["COMPLAINANT", "ACCUSED"]),
  contactNo: z.string().min(1),
  email: z.string().email().optional().nullable().or(z.literal("")),
  caseFileLink: z.string().url().optional().nullable().or(z.literal("")),
  previousDate: z.coerce.date().optional().nullable(),
  nextDate: z.coerce.date().optional().nullable(),
  steps: z.string().optional().nullable(),
})

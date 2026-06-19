"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auditLog } from "@/lib/audit"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { caseSchema } from "@/lib/validations/case"
import { CASE_REVALIDATE_PATHS, datesEqual } from "@/lib/case-helpers"
import type { CaseStatus } from "@/types"
import type { z } from "zod"

type CaseInput = z.infer<typeof caseSchema>

function revalidateCasePaths() {
  for (const path of CASE_REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalFields(parsed: CaseInput) {
  return {
    ...parsed,
    email: parsed.email === "" ? null : parsed.email ?? null,
    caseFileLink: parsed.caseFileLink === "" ? null : parsed.caseFileLink ?? null,
    previousDate: parsed.previousDate ?? null,
    nextDate: parsed.nextDate ?? null,
    steps: parsed.steps ?? null,
  }
}

async function logHistory(caseId: number, action: string, status: string) {
  await prisma.caseHistory.create({
    data: { caseId, date: new Date(), action, status },
  })
}

export async function createCase(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const parsed = normalizeOptionalFields(caseSchema.parse(data))
  const maxSerial = await prisma.case.aggregate({ _max: { serial: true } })
  const serial = (maxSerial._max.serial ?? 0) + 1

  const newCase = await prisma.case.create({
    data: {
      serial,
      clientName: parsed.clientName,
      caseNo: parsed.caseNo,
      court: parsed.court,
      caseType: parsed.caseType,
      onBehalf: parsed.onBehalf,
      contactNo: parsed.contactNo,
      email: parsed.email,
      caseFileLink: parsed.caseFileLink,
      previousDate: parsed.previousDate,
      nextDate: parsed.nextDate,
      steps: parsed.steps,
      status: "active",
    },
  })

  const parts = [`Case created`]
  if (parsed.nextDate) parts.push(`Next: ${parsed.nextDate.toLocaleDateString()}`)
  if (parsed.steps) parts.push(`Steps: ${parsed.steps}`)
  await logHistory(newCase.id, parts.join(". "), "active")
  await auditLog("case_create", `Created case ${newCase.caseNo}`, ip)
  revalidateCasePaths()
  return newCase
}

export async function updateCase(csrfToken: string, id: number, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const raw = caseSchema.partial().parse(data)
  const parsed = {
    ...raw,
    email: raw.email === "" ? null : raw.email,
    caseFileLink: raw.caseFileLink === "" ? null : raw.caseFileLink,
  }
  const existing = await prisma.case.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")

  const updateData: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(parsed)) {
    if (v !== undefined) updateData[k] = v
  }

  if (
    parsed.previousDate !== undefined &&
    !datesEqual(existing.previousDate, parsed.previousDate)
  ) {
    const label = parsed.previousDate ? parsed.previousDate.toLocaleDateString() : "cleared"
    await logHistory(existing.id, `Previous date changed to ${label}`, existing.status)
  }

  if (
    parsed.nextDate !== undefined &&
    !datesEqual(existing.nextDate, parsed.nextDate)
  ) {
    const label = parsed.nextDate ? parsed.nextDate.toLocaleDateString() : "cleared"
    await logHistory(existing.id, `Next hearing changed to ${label}`, existing.status)
  }

  if (parsed.steps !== undefined && existing.steps !== parsed.steps) {
    await logHistory(
      existing.id,
      parsed.steps ? `Steps: ${parsed.steps}` : "Steps cleared",
      existing.status
    )
  }

  const updated = await prisma.case.update({ where: { id }, data: updateData })
  await auditLog("case_update", `Updated case ${id}`, ip)
  revalidateCasePaths()
  return updated
}

export async function deleteCase(csrfToken: string, id: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  await prisma.caseHistory.deleteMany({ where: { caseId: id } })
  await prisma.case.delete({ where: { id } })
  await auditLog("case_delete", `Deleted case ${id}`, ip)
  revalidateCasePaths()
}

export async function toggleCaseStatus(csrfToken: string, id: number, status: CaseStatus) {
  const { ip } = await requireAdminMutation(csrfToken)
  await prisma.case.update({ where: { id }, data: { status } })
  await logHistory(id, `Status changed to ${status}`, status)
  await auditLog("case_status", `Case ${id} -> ${status}`, ip)
  revalidateCasePaths()
}

export async function getCaseHistory(csrfToken: string, caseId: number, phoneFilter?: string) {
  await requireAdminMutation(csrfToken)
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      history: { orderBy: { date: "desc" } },
    },
  })
  if (!caseRecord) throw new Error("Not found")
  if (phoneFilter?.trim()) {
    const q = phoneFilter.trim()
    if (!caseRecord.contactNo.includes(q)) return { case: caseRecord, history: [] }
  }
  return caseRecord
}

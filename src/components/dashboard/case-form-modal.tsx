"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Case, CourtType, OnBehalf } from "@prisma/client"
import { formatCourtName, formatOnBehalf, toDateInputValue } from "@/lib/case-helpers"

export interface CaseFormValues {
  clientName: string
  caseNo: string
  court: CourtType
  courtType: string
  caseType: string
  onBehalf: OnBehalf
  contactNo: string
  email: string
  caseFileLink: string
  previousDate: string
  nextDate: string
  steps: string
}

const emptyForm = (court: CourtType): CaseFormValues => ({
  clientName: "",
  caseNo: "",
  court,
  courtType: "",
  caseType: "",
  onBehalf: "COMPLAINANT",
  contactNo: "",
  email: "",
  caseFileLink: "",
  previousDate: "",
  nextDate: "",
  steps: "",
})

function caseToForm(c: Case): CaseFormValues {
  return {
    clientName: c.clientName,
    caseNo: c.caseNo,
    court: c.court,
    courtType: c.courtType ?? "",
    caseType: c.caseType,
    onBehalf: c.onBehalf,
    contactNo: c.contactNo,
    email: c.email ?? "",
    caseFileLink: c.caseFileLink ?? "",
    previousDate: toDateInputValue(c.previousDate),
    nextDate: toDateInputValue(c.nextDate),
    steps: c.steps ?? "",
  }
}

interface CaseFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCourt: CourtType
  lockCourt?: boolean
  editingCase?: Case | null
  onSubmit: (values: CaseFormValues) => Promise<void>
  isPending: boolean
}

export function CaseFormModal({
  open,
  onOpenChange,
  defaultCourt,
  lockCourt = false,
  editingCase,
  onSubmit,
  isPending,
}: CaseFormModalProps) {
  const [form, setForm] = useState<CaseFormValues>(() =>
    editingCase ? caseToForm(editingCase) : emptyForm(defaultCourt)
  )

  useEffect(() => {
    if (!open) return
    const base = {
      ...emptyForm(defaultCourt),
      ...(editingCase ? caseToForm(editingCase) : {}),
    }
    setForm(lockCourt ? { ...base, court: defaultCourt } : base)
  }, [open, editingCase, defaultCourt, lockCourt])

  const set = <K extends keyof CaseFormValues>(key: K, value: CaseFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleOpen = (next: boolean) => {
    if (next) {
      const base = {
        ...emptyForm(defaultCourt),
        ...(editingCase ? caseToForm(editingCase) : {}),
      }
      setForm(lockCourt ? { ...base, court: defaultCourt } : base)
    }
    onOpenChange(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.courtType.trim()) {
      return
    }
    await onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCase ? "Edit Case" : "Add New Case"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => set("clientName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseNo">Case No *</Label>
              <Input
                id="caseNo"
                value={form.caseNo}
                onChange={(e) => set("caseNo", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="court">Court *</Label>
              <select
                id="court"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                value={form.court}
                onChange={(e) => set("court", e.target.value as CourtType)}
                disabled={lockCourt}
              >
                <option value="JUDGE_COURT">{formatCourtName("JUDGE_COURT")}</option>
                <option value="HIGH_COURT">{formatCourtName("HIGH_COURT")}</option>
                <option value="SUPREME_COURT">{formatCourtName("SUPREME_COURT")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courtType">Court Type *</Label>
              <Input
                id="courtType"
                value={form.courtType}
                onChange={(e) => set("courtType", e.target.value)}
                placeholder="e.g. Sessions Court, Magistrate Court"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseType">Case Type *</Label>
              <Input
                id="caseType"
                value={form.caseType}
                onChange={(e) => set("caseType", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>On Behalf Of *</Label>
              <div className="flex gap-4">
                {(["COMPLAINANT", "ACCUSED"] as OnBehalf[]).map((v) => (
                  <label key={v} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="onBehalf"
                      value={v}
                      checked={form.onBehalf === v}
                      onChange={() => set("onBehalf", v)}
                    />
                    {formatOnBehalf(v)}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact No *</Label>
              <Input
                id="contactNo"
                value={form.contactNo}
                onChange={(e) => set("contactNo", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="caseFileLink">Case File (Google Drive link)</Label>
              <Input
                id="caseFileLink"
                type="url"
                placeholder="https://drive.google.com/..."
                value={form.caseFileLink}
                onChange={(e) => set("caseFileLink", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="previousDate">Previous Date</Label>
              <DatePickerField
                id="previousDate"
                value={form.previousDate}
                onChange={(value) => set("previousDate", value)}
                placeholder="Select previous date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDate">Next Date</Label>
              <DatePickerField
                id="nextDate"
                value={form.nextDate}
                onChange={(value) => set("nextDate", value)}
                placeholder="Select next date"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="steps">Steps / Notes</Label>
              <RichTextEditor
                value={form.steps}
                onChange={(value) => set("steps", value)}
                placeholder="Current case steps (auto-logged to history on save)"
                minHeightClassName="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : editingCase ? "Update Case" : "Create Case"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { emptyForm, caseToForm }

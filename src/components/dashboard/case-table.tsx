"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createCase,
  updateCase,
  deleteCase,
  toggleCaseStatus,
} from "@/actions/admin/case-actions"
import { CaseFormModal, type CaseFormValues } from "./case-form-modal"
import { CaseHistoryPanel } from "./case-history-panel"
import { useCsrf } from "@/components/admin/csrf-provider"
import { formatCourtName, formatOnBehalf } from "@/lib/case-helpers"
import { formatAppDate } from "@/lib/date-format"
import { ClientNow } from "@/components/dashboard/client-now"
import type { CaseStatus } from "@/types"
import type { Case, CaseHistory, CourtType } from "@prisma/client"
import { ExternalLink, History, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

type CaseWithHistory = Case & { history?: CaseHistory[] }

interface CaseTableProps {
  cases: CaseWithHistory[]
  title: string
  defaultCourt?: CourtType
  showCourtColumn?: boolean
  allowCreate?: boolean
  allowEdit?: boolean
  allowDelete?: boolean
  searchable?: boolean
  historyPhoneFilter?: boolean
  compact?: boolean
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === "active") return <Badge variant="warning">Active</Badge>
  if (s === "completed") return <Badge variant="success">Completed</Badge>
  if (s === "failed") return <Badge variant="destructive">Failed</Badge>
  return <Badge variant="muted">{status}</Badge>
}

function formToPayload(values: CaseFormValues) {
  return {
    clientName: values.clientName,
    caseNo: values.caseNo,
    court: values.court,
    caseType: values.caseType,
    onBehalf: values.onBehalf,
    contactNo: values.contactNo,
    email: values.email || null,
    caseFileLink: values.caseFileLink || null,
    previousDate: values.previousDate ? new Date(values.previousDate) : null,
    nextDate: values.nextDate ? new Date(values.nextDate) : null,
    steps: values.steps || null,
  }
}

export function CaseTable({
  cases,
  title,
  defaultCourt = "JUDGE_COURT",
  showCourtColumn = false,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  searchable = true,
  historyPhoneFilter = false,
  compact = false,
}: CaseTableProps) {
  const router = useRouter()
  const csrfToken = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | CaseStatus>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingCase, setEditingCase] = useState<CaseWithHistory | null>(null)
  const [historyCase, setHistoryCase] = useState<CaseWithHistory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CaseWithHistory | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cases.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (!q) return true
      return (
        c.clientName.toLowerCase().includes(q) ||
        c.contactNo.includes(q) ||
        c.caseNo.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [cases, search, statusFilter])

  const openCreate = () => {
    setEditingCase(null)
    setFormOpen(true)
  }

  const openEdit = (c: CaseWithHistory) => {
    setEditingCase(c)
    setFormOpen(true)
  }

  const handleSubmit = async (values: CaseFormValues) => {
    startTransition(async () => {
      try {
        const payload = formToPayload(values)
        if (editingCase) {
          await updateCase(csrfToken, editingCase.id, payload)
          toast.success("Case updated")
        } else {
          await createCase(csrfToken, payload)
          toast.success("Case created")
        }
        setFormOpen(false)
        router.refresh()
      } catch {
        toast.error("Could not save case")
      }
    })
  }

  const handleStatusChange = (c: CaseWithHistory, status: CaseStatus) => {
    startTransition(async () => {
      try {
        await toggleCaseStatus(csrfToken, c.id, status)
        toast.success(`Status set to ${status}`)
        router.refresh()
      } catch {
        toast.error("Could not update status")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      try {
        await deleteCase(csrfToken, deleteTarget.id)
        toast.success("Case deleted")
        setDeleteTarget(null)
        router.refresh()
      } catch {
        toast.error("Could not delete case")
      }
    })
  }

  return (
    <div className="case-table space-y-4">
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <Input
              placeholder="Search client, contact, case no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          )}
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | CaseStatus)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          {allowCreate && (
            <Button onClick={openCreate} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Case
            </Button>
          )}
        </div>
      </div>

      <p className="print-only hidden text-sm text-muted-foreground">
        Printed <ClientNow /> — {filtered.length} case(s)
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {!compact && <TableHead className="w-12">#</TableHead>}
              <TableHead>Client</TableHead>
              <TableHead>Case No</TableHead>
              {showCourtColumn && <TableHead>Court</TableHead>}
              <TableHead>Type</TableHead>
              {!compact && <TableHead>On Behalf</TableHead>}
              <TableHead>Contact</TableHead>
              {!compact && <TableHead>Email</TableHead>}
              <TableHead>Prev Date</TableHead>
              <TableHead>Next Date</TableHead>
              {!compact && <TableHead>Steps</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>File</TableHead>
              {!compact && <TableHead className="no-print text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={compact ? 9 : 13}
                  className="text-center text-muted-foreground"
                >
                  No cases found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  {!compact && <TableCell className="text-muted-foreground">{c.serial ?? "—"}</TableCell>}
                  <TableCell className="font-medium">{c.clientName}</TableCell>
                  <TableCell>{c.caseNo}</TableCell>
                  {showCourtColumn && <TableCell>{formatCourtName(c.court)}</TableCell>}
                  <TableCell>{c.caseType}</TableCell>
                  {!compact && <TableCell>{formatOnBehalf(c.onBehalf)}</TableCell>}
                  <TableCell>{c.contactNo}</TableCell>
                  {!compact && <TableCell className="max-w-[120px] truncate">{c.email || "—"}</TableCell>}
                  <TableCell className="whitespace-nowrap">
                    {formatAppDate(c.previousDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatAppDate(c.nextDate)}
                  </TableCell>
                  {!compact && (
                    <TableCell className="max-w-[160px] truncate" title={c.steps ?? undefined}>
                      {c.steps || "—"}
                    </TableCell>
                  )}
                  <TableCell>
                    {allowEdit ? (
                      <select
                        className="h-8 rounded border border-input bg-background px-1 text-xs"
                        value={c.status}
                        disabled={isPending}
                        onChange={(e) => handleStatusChange(c, e.target.value as CaseStatus)}
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    ) : (
                      <StatusBadge status={c.status} />
                    )}
                  </TableCell>
                  <TableCell>
                    {c.caseFileLink ? (
                      <a
                        href={c.caseFileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Drive
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  {!compact && (
                    <TableCell className="no-print text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="History"
                          onClick={() => setHistoryCase(c)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        {allowEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {allowDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            onClick={() => setDeleteTarget(c)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CaseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultCourt={defaultCourt}
        editingCase={editingCase}
        onSubmit={handleSubmit}
        isPending={isPending}
      />

      <CaseHistoryPanel
        caseRecord={historyCase}
        open={!!historyCase}
        onOpenChange={(open) => !open && setHistoryCase(null)}
        filterableByPhone={historyPhoneFilter}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete case?</DialogTitle>
            <DialogDescription>
              Permanently delete case <strong>{deleteTarget?.caseNo}</strong> for{" "}
              {deleteTarget?.clientName}? History will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

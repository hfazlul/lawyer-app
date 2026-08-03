"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
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
  toggleCaseStatus,
  reopenCase,
} from "@/actions/admin/case-actions"
import { CaseFormModal, type CaseFormValues } from "./case-form-modal"
import { CaseHistoryPanel } from "./case-history-panel"
import { useCsrf } from "@/components/admin/csrf-provider"
import { formatCourtName, formatOnBehalf, stripHtmlTags } from "@/lib/case-helpers"
import { formatAppDate, toAppDateKey } from "@/lib/date-format"
import { cn } from "@/lib/utils"
import { ClientNow } from "@/components/dashboard/client-now"
import { DEFAULT_TABLE_PAGE_SIZE, TablePagination } from "@/components/ui/table-pagination"
import type { CaseStatus } from "@/types"
import type { Case, CaseHistory, CourtType } from "@prisma/client"
import { PhoneContact } from "@/components/dashboard/phone-contact"
import { isDeactiveStatus, isActiveStatus } from "@/lib/cause-list-filters"
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
  pageSize?: number
  /** Show every column on small screens (horizontal scroll). Used on cause list. */
  mobileFullColumns?: boolean
  /** When set, table shows only that status bucket and hides the status filter dropdown. */
  listMode?: "active" | "completed" | "deactive"
  /** Lock the court field to defaultCourt (used on court-specific pages/tabs). */
  lockCourt?: boolean
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === "active") return <Badge variant="warning">Active</Badge>
  if (s === "completed") return <Badge variant="success">Completed</Badge>
  if (isDeactiveStatus(s)) return <Badge variant="destructive">Deactive</Badge>
  return <Badge variant="muted">{status}</Badge>
}

function getCaseRowClassName(status: string) {
  const s = status.toLowerCase()
  if (isDeactiveStatus(s)) {
    return "bg-red-50/90 hover:bg-red-100/80 border-l-4 border-l-red-400"
  }
  if (s === "completed") {
    return "bg-emerald-50/90 hover:bg-emerald-100/80 border-l-4 border-l-emerald-500"
  }
  return "hover:bg-muted/40"
}

function formToPayload(values: CaseFormValues) {
  return {
    clientName: values.clientName,
    caseNo: values.caseNo,
    court: values.court,
    courtType: values.courtType?.trim() ?? "",
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
  pageSize = DEFAULT_TABLE_PAGE_SIZE,
  mobileFullColumns = false,
  listMode,
  lockCourt = false,
}: CaseTableProps) {
  const router = useRouter()
  const hideOnMobile = (classes: string) => (mobileFullColumns ? "" : classes)
  const csrfToken = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [tableCases, setTableCases] = useState(cases)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | CaseStatus>("all")
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCase, setEditingCase] = useState<CaseWithHistory | null>(null)
  const [historyCase, setHistoryCase] = useState<CaseWithHistory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CaseWithHistory | null>(null)
  const [reopenTarget, setReopenTarget] = useState<CaseWithHistory | null>(null)
  const [reopenNextDate, setReopenNextDate] = useState("")
  const [reopenSteps, setReopenSteps] = useState("")

  useEffect(() => {
    setTableCases(cases)
  }, [cases])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tableCases.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (!q) return true
      return (
        c.clientName.toLowerCase().includes(q) ||
        c.contactNo.includes(q) ||
        c.caseNo.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [tableCases, search, statusFilter])

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  const paginated = useMemo(() => {
    const start = page * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1))
  }, [filtered.length, page, pageSize])

  const openCreate = () => {
    setEditingCase(null)
    setFormOpen(true)
  }

  const openEdit = (c: CaseWithHistory) => {
    setEditingCase(c)
    setFormOpen(true)
  }

  const handleSubmit = async (values: CaseFormValues) => {
    if (!values.courtType?.trim()) {
      toast.error("Court type is required")
      return
    }

    if (values.nextDate) {
      const nextKey = toAppDateKey(values.nextDate)
      const todayKey = toAppDateKey(new Date())
      if (nextKey < todayKey) {
        toast.error("Next hearing date cannot be in the past")
        return
      }
    }

    const submitValues = lockCourt ? { ...values, court: defaultCourt } : values

    startTransition(async () => {
      try {
        const payload = formToPayload(submitValues)
        if (editingCase) {
          const updated = await updateCase(csrfToken, editingCase.id, payload)
          setTableCases((prev) =>
            prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
          )
          toast.success("Case updated")
        } else {
          const created = await createCase(csrfToken, payload)
          setTableCases((prev) => [
            created as CaseWithHistory,
            ...prev.filter((c) => c.id !== created.id),
          ])
          toast.success("Case created")
        }
        setPage(0)
        setSearch("")
        setFormOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save case")
      }
    })
  }

  const handleStatusChange = (c: CaseWithHistory, status: CaseStatus) => {
    const currentStatus = isDeactiveStatus(c.status) ? "deactive" : c.status.toLowerCase()
    const nextStatus: CaseStatus = status === "deactive" ? "deactive" : status

    if (nextStatus === "active" && !isActiveStatus(currentStatus)) {
      setReopenNextDate("")
      setReopenSteps(c.steps ?? "")
      setReopenTarget(c)
      return
    }

    startTransition(async () => {
      try {
        await toggleCaseStatus(csrfToken, c.id, nextStatus)
        toast.success(`Status set to ${nextStatus === "deactive" ? "Deactive" : nextStatus}`)
        router.refresh()
      } catch {
        toast.error("Could not update status")
      }
    })
  }

  const handleReopen = () => {
    if (!reopenTarget || !reopenNextDate.trim()) {
      toast.error("Next hearing date is required")
      return
    }
    if (!reopenSteps.trim()) {
      toast.error("Steps are required when re-opening a case")
      return
    }

    startTransition(async () => {
      try {
        await reopenCase(csrfToken, reopenTarget.id, {
          nextDate: new Date(reopenNextDate),
          steps: reopenSteps,
        })
        toast.success("Case re-opened as Active")
        setReopenTarget(null)
        router.refresh()
      } catch {
        toast.error("Could not re-open case")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/cases/${deleteTarget.id}`, {
          method: "DELETE",
          credentials: "same-origin",
          cache: "no-store",
        })
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        if (!res.ok) throw new Error(body.error || "Could not delete case")
        toast.success("Case deleted — saved to archive")
        setDeleteTarget(null)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not delete case")
      }
    })
  }

  const showActionsColumn = !compact && (allowEdit || allowDelete)

  const columnCount =
    9 +
    (showCourtColumn ? 1 : 0) +
    (compact ? 1 : 5 + (showActionsColumn ? 1 : 0))

  return (
    <div className="case-table space-y-4">
      {title ? (
        <h2 className="hidden text-xl font-semibold print:block">{title}</h2>
      ) : null}
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
          {!listMode && (
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | CaseStatus)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="deactive">Deactive</option>
            </select>
          )}
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

      <div className="rounded-md border overflow-hidden">
        <div className="table-scroll-hint text-center text-[10px] text-muted-foreground md:hidden">
          Swipe left/right to see all columns
        </div>
        <div className="overflow-x-auto">
        <Table className={cn(mobileFullColumns && "min-w-max text-xs sm:text-sm")}>
          <TableHeader>
            <TableRow>
              {!compact && <TableHead className={cn("w-12", hideOnMobile("hidden sm:table-cell"))}>#</TableHead>}
              <TableHead>Client</TableHead>
              <TableHead className={cn(mobileFullColumns ? "min-w-[7rem] max-w-[10rem]" : "min-w-[5.5rem] sm:min-w-0")}>
                Case No
              </TableHead>
              {showCourtColumn && <TableHead className={hideOnMobile("hidden md:table-cell")}>Court</TableHead>}
              <TableHead className={hideOnMobile("hidden sm:table-cell")}>Court Type</TableHead>
              <TableHead className={hideOnMobile("hidden sm:table-cell")}>Type</TableHead>
              {!compact && <TableHead className={hideOnMobile("hidden lg:table-cell")}>On Behalf</TableHead>}
              <TableHead>Contact</TableHead>
              {!compact && <TableHead className={hideOnMobile("hidden lg:table-cell")}>Email</TableHead>}
              <TableHead className={hideOnMobile("hidden md:table-cell")}>Prev Date</TableHead>
              <TableHead>Next Date</TableHead>
              {!compact && <TableHead className={hideOnMobile("hidden xl:table-cell")}>Steps</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className={hideOnMobile("hidden sm:table-cell")}>File</TableHead>
              <TableHead className="no-print text-center">History</TableHead>
              {showActionsColumn && <TableHead className="no-print text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-center text-muted-foreground"
                >
                  No cases found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((c, index) => (
                <TableRow key={c.id} className={cn("transition-colors", getCaseRowClassName(c.status))}>
                  {!compact && (
                    <TableCell className={cn("text-muted-foreground", hideOnMobile("hidden sm:table-cell"))}>
                      {page * pageSize + index + 1}
                    </TableCell>
                  )}
                  <TableCell className={cn("font-medium", mobileFullColumns ? "max-w-[140px]" : "max-w-[120px] sm:max-w-none")}>
                    {c.clientName}
                  </TableCell>
                  <TableCell
                    className={cn(
                      mobileFullColumns
                        ? "max-w-[10rem] break-words whitespace-normal"
                        : "max-w-[7rem] break-words whitespace-normal sm:max-w-none sm:whitespace-nowrap"
                    )}
                  >
                    {c.caseNo}
                  </TableCell>
                  {showCourtColumn && (
                    <TableCell className={hideOnMobile("hidden md:table-cell")}>{formatCourtName(c.court)}</TableCell>
                  )}
                  <TableCell className={hideOnMobile("hidden sm:table-cell")}>{c.courtType || "—"}</TableCell>
                  <TableCell className={hideOnMobile("hidden sm:table-cell")}>{c.caseType}</TableCell>
                  {!compact && (
                    <TableCell className={hideOnMobile("hidden lg:table-cell")}>{formatOnBehalf(c.onBehalf)}</TableCell>
                  )}
                  <TableCell>
                    <PhoneContact phone={c.contactNo} />
                  </TableCell>
                  {!compact && (
                    <TableCell className={cn("max-w-[120px] truncate", hideOnMobile("hidden lg:table-cell"))}>
                      {c.email || "—"}
                    </TableCell>
                  )}
                  <TableCell className={cn("whitespace-nowrap", hideOnMobile("hidden md:table-cell"))}>
                    {formatAppDate(c.previousDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatAppDate(c.nextDate)}
                  </TableCell>
                  {!compact && (
                    <TableCell
                      className={cn("max-w-[160px] truncate", hideOnMobile("hidden xl:table-cell"))}
                      title={c.steps ? stripHtmlTags(c.steps) : undefined}
                    >
                      {c.steps ? stripHtmlTags(c.steps) : "—"}
                    </TableCell>
                  )}
                  <TableCell>
                    {allowEdit ? (
                      <select
                        className="h-8 rounded border border-input bg-background px-1 text-xs"
                        value={isDeactiveStatus(c.status) ? "deactive" : c.status}
                        disabled={isPending}
                        onChange={(e) => handleStatusChange(c, e.target.value as CaseStatus)}
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="deactive">Deactive</option>
                      </select>
                    ) : (
                      <StatusBadge status={c.status} />
                    )}
                  </TableCell>
                  <TableCell className={hideOnMobile("hidden sm:table-cell")}>
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
                  <TableCell className="no-print text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View history"
                      onClick={() => setHistoryCase(c)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  {showActionsColumn && (
                    <TableCell className="no-print text-right">
                      <div className="flex justify-end gap-1">
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
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <CaseFormModal
        key={editingCase?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultCourt={defaultCourt}
        lockCourt={lockCourt}
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

      <Dialog open={!!reopenTarget} onOpenChange={(open) => !open && setReopenTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Re-open case</DialogTitle>
            <DialogDescription>
              Set the next hearing date and steps to move{" "}
              <strong>{reopenTarget?.caseNo}</strong> ({reopenTarget?.clientName}) back to Active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reopen-next-date">Next hearing date *</Label>
              <DatePickerField
                id="reopen-next-date"
                value={reopenNextDate}
                onChange={setReopenNextDate}
                placeholder="Select next hearing date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reopen-steps">Steps / Notes *</Label>
              <RichTextEditor
                value={reopenSteps}
                onChange={setReopenSteps}
                placeholder="Current steps for this hearing"
                minHeightClassName="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReopenTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleReopen} disabled={isPending}>
              {isPending ? "Saving…" : "Re-open as Active"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

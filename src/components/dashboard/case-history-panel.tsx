"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCaseHistory } from "@/actions/admin/case-actions"
import { useCsrf } from "@/components/admin/csrf-provider"
import type { Case, CaseHistory } from "@prisma/client"
import { ExternalLink, History } from "lucide-react"
import { formatCourtName, formatOnBehalf, getGDrivePreviewUrl } from "@/lib/case-helpers"
import { formatAppDate, formatAppDateTime } from "@/lib/date-format"
import { StepsHtmlContent } from "@/components/dashboard/steps-html-content"
import { HistoryActionContent } from "@/components/dashboard/history-action-content"
import { PhoneContact } from "@/components/dashboard/phone-contact"
import { isDeactiveStatus } from "@/lib/cause-list-filters"

type CaseWithHistory = Case & { history?: CaseHistory[] }

interface CaseHistoryPanelProps {
  caseRecord: CaseWithHistory | null
  open: boolean
  onOpenChange: (open: boolean) => void
  filterableByPhone?: boolean
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === "active") return <Badge variant="warning">Active</Badge>
  if (s === "completed") return <Badge variant="success">Completed</Badge>
  if (isDeactiveStatus(s)) return <Badge variant="destructive">Deactive</Badge>
  return <Badge variant="muted">{status}</Badge>
}

export function CaseHistoryPanel({
  caseRecord,
  open,
  onOpenChange,
  filterableByPhone = false,
}: CaseHistoryPanelProps) {
  const csrf = useCsrf()
  const [phoneFilter, setPhoneFilter] = useState("")
  const [history, setHistory] = useState<CaseHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!open || !caseRecord?.id) {
      if (!open) setHistory([])
      return
    }

    let cancelled = false
    setLoading(true)

    startTransition(async () => {
      try {
        const data = await getCaseHistory(
          csrf || null,
          caseRecord.id,
          filterableByPhone ? phoneFilter : undefined
        )
        if (!cancelled) setHistory(data.history ?? [])
      } catch {
        if (!cancelled) setHistory([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [open, caseRecord?.id, csrf, phoneFilter, filterableByPhone])

  if (!caseRecord) return null

  const previewUrl = caseRecord.caseFileLink
    ? getGDrivePreviewUrl(caseRecord.caseFileLink)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Case History — {caseRecord.clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid gap-2 rounded-lg border p-4 sm:grid-cols-2">
            <p><span className="text-muted-foreground">Serial:</span> {caseRecord.serial ?? "—"}</p>
            <p><span className="text-muted-foreground">Case No:</span> {caseRecord.caseNo}</p>
            <p><span className="text-muted-foreground">Court:</span> {formatCourtName(caseRecord.court)}</p>
            <p><span className="text-muted-foreground">Court Type:</span> {caseRecord.courtType || "—"}</p>
            <p><span className="text-muted-foreground">Type:</span> {caseRecord.caseType}</p>
            <p><span className="text-muted-foreground">On Behalf:</span> {formatOnBehalf(caseRecord.onBehalf)}</p>
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Contact:</span>
              <PhoneContact phone={caseRecord.contactNo} />
            </p>
            <p><span className="text-muted-foreground">Email:</span> {caseRecord.email || "—"}</p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={caseRecord.status} />
            </p>
            <p>
              <span className="text-muted-foreground">Previous:</span>{" "}
              {formatAppDate(caseRecord.previousDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Next:</span>{" "}
              {formatAppDate(caseRecord.nextDate)}
            </p>
            {caseRecord.steps && (
              <div className="sm:col-span-2">
                <p className="mb-1 text-muted-foreground">Steps:</p>
                <StepsHtmlContent html={caseRecord.steps} />
              </div>
            )}
          </div>

          {caseRecord.caseFileLink && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Case File</span>
                <Button variant="outline" size="sm" asChild>
                  <a href={caseRecord.caseFileLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Open in Drive
                  </a>
                </Button>
              </div>
              {previewUrl && (
                <div className="overflow-hidden rounded-lg border bg-muted/30 shadow-inner">
                  <iframe
                    src={previewUrl}
                    className="h-[min(420px,50vh)] min-h-[240px] w-full border-0 bg-white sm:min-h-[400px] sm:h-[min(560px,58vh)]"
                    title="Case file preview"
                    allow="autoplay"
                  />
                </div>
              )}
            </div>
          )}

          {filterableByPhone && (
            <Input
              placeholder="Filter by contact phone…"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
            />
          )}

          <div>
            <h4 className="mb-2 font-medium">Timeline (auto-generated)</h4>
            {loading ? (
              <p className="text-muted-foreground">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground">No history entries yet.</p>
            ) : (
              <ol className="relative space-y-5 border-l-2 border-primary/20 pl-5">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-sm" />
                    <p className="mb-1 text-xs text-muted-foreground">
                      {formatAppDateTime(h.date)}
                    </p>
                    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                      <HistoryActionContent action={h.action} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

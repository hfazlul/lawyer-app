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
  if (s === "failed") return <Badge variant="destructive">Failed</Badge>
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
    if (!open || !caseRecord?.id || !csrf) {
      if (!open) setHistory([])
      return
    }

    let cancelled = false
    setLoading(true)

    startTransition(async () => {
      try {
        const data = await getCaseHistory(
          csrf,
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
            <p><span className="text-muted-foreground">Type:</span> {caseRecord.caseType}</p>
            <p><span className="text-muted-foreground">On Behalf:</span> {formatOnBehalf(caseRecord.onBehalf)}</p>
            <p><span className="text-muted-foreground">Contact:</span> {caseRecord.contactNo}</p>
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
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">Steps:</span> {caseRecord.steps}
              </p>
            )}
          </div>

          {caseRecord.caseFileLink && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Case File</span>
                <Button variant="outline" size="sm" asChild>
                  <a href={caseRecord.caseFileLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Open in Drive
                  </a>
                </Button>
              </div>
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  className="h-48 w-full rounded-md border"
                  title="Case file preview"
                />
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
              <ol className="relative space-y-4 border-l pl-4">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-xs text-muted-foreground">
                      {formatAppDateTime(h.date)}
                    </p>
                    <p>{h.action}</p>
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

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ARCHIVE_RETENTION_DAYS } from "@/lib/constants"
import { caseCourtListPath } from "@/lib/case-helpers"
import { formatAppDate, formatAppDateTime } from "@/lib/date-format"
import { toast } from "sonner"
import { Loader2, RotateCcw, Trash2 } from "lucide-react"
import type { Archive } from "@prisma/client"

type CaseArchiveData = { case?: { caseNo?: string; clientName?: string; court?: string } }

async function archiveFetch(url: string, method: "POST" | "DELETE") {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    cache: "no-store",
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string; court?: string | null; deleted?: number }
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return body
}

export function ArchiveList({
  archives,
  emptyTitle = "No archived content.",
  emptyDescription,
}: {
  archives: Archive[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [restoringId, setRestoringId] = useState<number | null>(null)

  const handleRestore = async (archive: Archive) => {
    setIsPending(true)
    setRestoringId(archive.id)
    try {
      const result = await archiveFetch(`/api/archives/${archive.id}/restore`, "POST")
      const caseData = archive.data as CaseArchiveData
      const label =
        archive.tableName === "Case"
          ? `Case ${caseData.case?.caseNo ?? archive.recordId} restored`
          : `${archive.tableName} restored`

      toast.success(label)

      if (archive.tableName === "Case") {
        const court = result.court ?? caseData.case?.court ?? ""
        router.push(caseCourtListPath(court))
        router.refresh()
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed")
    } finally {
      setIsPending(false)
      setRestoringId(null)
    }
  }

  const confirmDelete = (archiveId: number, tableName: string) => {
    toast.warning(`Delete this ${tableName} archive?`, {
      description: "This cannot be undone.",
      duration: Infinity,
      action: {
        label: "Delete",
        onClick: () => {
          void (async () => {
            setIsPending(true)
            try {
              await archiveFetch(`/api/archives/${archiveId}`, "DELETE")
              toast.success("Permanently deleted")
              router.refresh()
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Delete failed")
            } finally {
              setIsPending(false)
            }
          })()
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }

  const confirmDeleteAll = () => {
    toast.warning(`Delete all ${archives.length} archives?`, {
      description: "This cannot be undone.",
      duration: Infinity,
      action: {
        label: "Delete all",
        onClick: () => {
          void (async () => {
            setIsPending(true)
            try {
              const result = await archiveFetch("/api/archives/delete-all", "DELETE")
              toast.success(`Deleted ${result.deleted ?? archives.length} archives`)
              router.refresh()
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Delete failed")
            } finally {
              setIsPending(false)
            }
          })()
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }

  if (archives.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>{emptyTitle}</p>
        <p className="mt-1 text-sm">
          {emptyDescription ??
            `Deleted CMS items and client messages appear here for ${ARCHIVE_RETENTION_DAYS} days.`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{archives.length} archived item(s)</p>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={confirmDeleteAll}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete all
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead>Archived</TableHead>
              <TableHead>Auto-delete</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archives.map((a) => {
              const expired = new Date(a.autoDeleteAt).getTime() <= Date.now()
              const caseData = a.data as CaseArchiveData
              const isRestoring = restoringId === a.id
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <Badge variant="secondary">
                      {a.tableName === "Case"
                        ? `Case #${caseData.case?.caseNo ?? a.recordId}`
                        : a.tableName}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.recordId}</TableCell>
                  <TableCell className="text-sm">{formatAppDateTime(a.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={expired ? "destructive" : "warning"}>
                      {formatAppDate(a.autoDeleteAt)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Restore"
                        disabled={isPending}
                        onClick={() => void handleRestore(a)}
                      >
                        {isRestoring ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Permanent delete"
                        disabled={isPending}
                        onClick={() => confirmDelete(a.id, a.tableName)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

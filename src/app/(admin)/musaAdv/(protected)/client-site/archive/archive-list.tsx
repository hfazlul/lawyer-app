"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { restoreFromArchive, permanentDeleteArchive } from "@/actions/admin/archive"
import { useCsrf } from "@/components/admin/csrf-provider"
import { ARCHIVE_RETENTION_DAYS } from "@/lib/constants"
import { formatAppDate, formatAppDateTime } from "@/lib/date-format"
import { toast } from "sonner"
import { RotateCcw, Trash2 } from "lucide-react"
import type { Archive } from "@prisma/client"

export function ArchiveList({ archives }: { archives: Archive[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()

  const run = (fn: () => Promise<unknown>, success: string) => {
    startTransition(async () => {
      try {
        await fn()
        toast.success(success)
        router.refresh()
      } catch {
        toast.error("Action failed")
      }
    })
  }

  if (archives.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>No archived content.</p>
        <p className="mt-1 text-sm">Updated or deleted CMS items appear here for {ARCHIVE_RETENTION_DAYS} days.</p>
      </div>
    )
  }

  return (
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
          return (
            <TableRow key={a.id}>
              <TableCell><Badge variant="secondary">{a.tableName}</Badge></TableCell>
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
                    onClick={() => run(() => restoreFromArchive(csrf, a.id), "Restored")}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Permanent delete"
                    disabled={isPending}
                    onClick={() => {
                      if (confirm("Permanently delete this archive? This cannot be undone.")) {
                        run(() => permanentDeleteArchive(csrf, a.id), "Permanently deleted")
                      }
                    }}
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
  )
}

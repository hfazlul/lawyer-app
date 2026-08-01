"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { restoreBackup } from "@/actions/admin/backup-actions"
import { useCsrf } from "@/components/admin/csrf-provider"
import { formatAppDateTime } from "@/lib/date-format"

interface Backup {
  name: string
  size: number
  createdAt: string | Date
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BackupList({ backups }: { backups: Backup[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleDownload = (name: string) => {
    window.open(`/api/backups/download?file=${encodeURIComponent(name)}`, "_blank")
  }

  const handleDelete = (name: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/backups/delete?file=${encodeURIComponent(name)}`, {
          method: "DELETE",
          headers: { "X-CSRF-Token": csrf },
        })
        if (!res.ok) throw new Error("Delete failed")
        toast.success("Backup deleted")
        setDeleteTarget(null)
        router.refresh()
      } catch {
        toast.error("Could not delete backup")
      }
    })
  }

  const handleRestore = (name: string) => {
    startTransition(async () => {
      try {
        await restoreBackup(csrf, name)
        toast.success("Backup restored successfully")
        setRestoreTarget(null)
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Restore failed"
        toast.error(message)
      }
    })
  }

  if (backups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>No backups yet.</p>
        <p className="mt-1 text-sm">Export a backup to get started.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {backups.map((b) => (
            <TableRow key={b.name}>
              <TableCell className="font-mono text-sm">{b.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{formatSize(b.size)}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {formatAppDateTime(b.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Download"
                    onClick={() => handleDownload(b.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Restore"
                    onClick={() => setRestoreTarget(b.name)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    onClick={() => setDeleteTarget(b.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore backup?</DialogTitle>
            <DialogDescription>
              This will overwrite the current database and uploads with the contents of{" "}
              <span className="font-mono font-medium">{restoreTarget}</span>. This action cannot be
              undone. Make sure you have a recent backup before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => restoreTarget && handleRestore(restoreTarget)}
            >
              {isPending ? "Restoring…" : "Restore backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete backup?</DialogTitle>
            <DialogDescription>
              Permanently delete <span className="font-mono font-medium">{deleteTarget}</span>? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Archive, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCsrf } from "@/components/admin/csrf-provider"

interface CmsItemActionsProps {
  id: number
  status?: string
  onEdit?: () => void
  onToggleStatus?: (csrfToken: string, id: number, status: string) => Promise<void>
  onArchive?: (csrfToken: string, id: number) => Promise<void>
  onDelete?: (csrfToken: string, id: number) => Promise<void>
  showEdit?: boolean
}

export function CmsItemActions({
  id,
  status = "active",
  onEdit,
  onToggleStatus,
  onArchive,
  onDelete,
  showEdit = true,
}: CmsItemActionsProps) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const isActive = status === "active"

  const run = (fn: () => Promise<void>, success: string) => {
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

  return (
    <div className="flex items-center gap-1">
      <Badge variant={isActive ? "success" : "muted"}>{isActive ? "Active" : "Inactive"}</Badge>
      {showEdit && onEdit && (
        <Button type="button" variant="ghost" size="icon" onClick={onEdit} disabled={isPending}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onToggleStatus && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={isActive ? "Deactivate" : "Activate"}
          disabled={isPending}
          onClick={() =>
            run(
              () => onToggleStatus(csrf, id, isActive ? "inactive" : "active"),
              "Status updated"
            )
          }
        >
          {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      )}
      {onArchive && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Archive"
          disabled={isPending}
          onClick={() => run(() => onArchive(csrf, id), "Archived")}
        >
          <Archive className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Delete"
          disabled={isPending}
          onClick={() => {
            if (confirm("Permanently delete this item?")) {
              run(() => onDelete(csrf, id), "Deleted")
            }
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}

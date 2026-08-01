"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { backupDatabase } from "@/actions/admin/backup-actions"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"

export function CreateBackupButton() {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await backupDatabase(csrf)
        toast.success("Backup exported")
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Backup failed"
        toast.error(message)
      }
    })
  }

  return (
    <Button type="button" onClick={handleCreate} disabled={isPending}>
        {isPending ? "Exporting…" : "Export Backup"}
    </Button>
  )
}

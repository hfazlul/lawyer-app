"use client"

import { useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import { Upload } from "lucide-react"

export function ImportBackupButton() {
  const router = useRouter()
  const csrf = useCsrf()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("backup", file)

    startTransition(async () => {
      try {
        const res = await fetch("/api/backups/import", {
          method: "POST",
          headers: { "X-CSRF-Token": csrf },
          body: formData,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.error || "Import failed")
        }
        toast.success("Backup imported and restored successfully")
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Import failed"
        toast.error(message)
      } finally {
        if (inputRef.current) inputRef.current.value = ""
      }
    })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isPending ? "Importing…" : "Import & Restore"}
      </Button>
    </>
  )
}

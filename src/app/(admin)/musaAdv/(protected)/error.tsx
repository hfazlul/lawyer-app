"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { adminPath } from "@/lib/constants"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin error:", error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="max-w-md text-muted-foreground">
        An error occurred in the admin panel. You can try again or return to the dashboard.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href={adminPath("dashboard")}>Go to Dashboard</a>
        </Button>
      </div>
    </div>
  )
}

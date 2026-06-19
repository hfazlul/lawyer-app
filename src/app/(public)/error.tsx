"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Public site error:", error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold">Page unavailable</h2>
      <p className="max-w-md text-muted-foreground">
        We could not load this page. Please try again or return to the home page.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/">Go Home</a>
        </Button>
      </div>
    </div>
  )
}

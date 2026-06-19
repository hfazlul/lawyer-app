"use client"

import { useEffect, useState } from "react"
import { formatAppDateTime } from "@/lib/date-format"

/** Renders the current time only after mount to avoid SSR/client hydration drift. */
export function ClientNow() {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    setNow(formatAppDateTime(new Date()))
  }, [])

  return <>{now ?? "—"}</>
}

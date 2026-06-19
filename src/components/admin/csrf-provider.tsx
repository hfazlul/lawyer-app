"use client"

import { createContext, useContext, useEffect, useState } from "react"

const CsrfContext = createContext<string>("")

export function CsrfProvider({
  initialToken,
  children,
}: {
  initialToken?: string
  children: React.ReactNode
}) {
  const [token, setToken] = useState(initialToken ?? "")

  useEffect(() => {
    if (token) return

    fetch("/api/csrf", { credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CSRF token")
        return res.json() as Promise<{ token: string }>
      })
      .then((data) => setToken(data.token))
      .catch(() => {})
  }, [token])

  return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>
}

export function useCsrf(): string {
  return useContext(CsrfContext)
}

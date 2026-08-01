export async function ensureCsrfToken(): Promise<string> {
  const res = await fetch("/api/csrf", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Session not ready — please refresh the page")
  }
  const data = (await res.json()) as { token?: string }
  if (!data.token) {
    throw new Error("Could not load security token")
  }
  return data.token
}

export async function adminApiFetch(url: string, init: RequestInit = {}) {
  const token = await ensureCsrfToken()
  const { headers, ...rest } = init
  const res = await fetch(url, {
    ...rest,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...headers,
      "x-csrf-token": token,
    },
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return body
}

import { cookies } from "next/headers"
import { randomBytes } from "crypto"
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { CSRF_COOKIE } from "./constants"
import { useSecureCookies } from "./cookie-security"

export const CSRF_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: "lax",
  secure: useSecureCookies(),
  path: "/",
  maxAge: 60 * 60 * 24,
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex")
}

/** Route Handlers and Server Actions only — not Server Components. */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE, token, CSRF_COOKIE_OPTIONS)
  return token
}

/** Read-only — safe in Server Components. */
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE)?.value
}

/** Route Handlers only — sets cookie when missing. */
export async function getOrSetCsrfToken(): Promise<string> {
  const existing = await getCsrfToken()
  if (existing) return existing
  return setCsrfCookie()
}

export async function verifyCsrfToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false
  const cookieStore = await cookies()
  const stored = cookieStore.get(CSRF_COOKIE)?.value
  return Boolean(stored && stored === token)
}

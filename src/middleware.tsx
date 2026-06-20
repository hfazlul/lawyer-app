import { auth } from "@/lib/auth"
import { ADMIN_BASE, ADMIN_INTERNAL_PREFIX, adminPath } from "@/lib/constants"
import { NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rate-limiter"
import type { AdminSessionUser } from "@/types"

export default auth((req) => {
  const sessionUser = req.auth?.user as AdminSessionUser | undefined
  const isAdmin = sessionUser?.role === "admin"
  const path = req.nextUrl.pathname

  if (path.startsWith("/api/auth")) return NextResponse.next()
  if (path === "/api/csrf") {
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.next()
  }
  if (path.startsWith("/api/backups")) {
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.next()
  }
  if (path.startsWith("/api/upload") || path.startsWith("/api/archives")) {
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.next()
  }

  const internalBase = `/${ADMIN_INTERNAL_PREFIX}`
  if (ADMIN_BASE !== internalBase && path.startsWith(internalBase)) {
    const suffix = path.slice(internalBase.length)
    return NextResponse.redirect(new URL(`${ADMIN_BASE}${suffix}`, req.url))
  }

  if (!path.startsWith(ADMIN_BASE)) return NextResponse.next()

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "anonymous"

  // Only rate-limit mutations — Next.js RSC/prefetch sends many GETs per page load.
  const isMutation = req.method === "POST"

  if (path === adminPath("signup")) {
    if (isMutation && !rateLimiter(`signup:${ip}`, 5, 60_000)) {
      return new NextResponse("Too many attempts.", { status: 429 })
    }
    if (isAdmin) return NextResponse.redirect(new URL(adminPath("dashboard"), req.url))
    return NextResponse.next()
  }

  if (path === adminPath("signup-recovery")) {
    return NextResponse.next()
  }

  if (path === adminPath("login") || path === adminPath("forgot-password")) {
    if (isMutation && !rateLimiter(`${path}:${ip}`, 5, 60_000)) {
      return new NextResponse("Too many attempts.", { status: 429 })
    }
    if (isAdmin) return NextResponse.redirect(new URL(adminPath("dashboard"), req.url))
    return NextResponse.next()
  }

  if (path === ADMIN_BASE) return NextResponse.next()

  if (!isAdmin) {
    const loginUrl = new URL(adminPath("login"), req.url)
    loginUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/musaAdv",
    "/musaAdv/:path*",
    "/saifulAdv",
    "/saifulAdv/:path*",
    "/api/auth/:path*",
    "/api/csrf",
    "/api/backups/:path*",
    "/api/upload",
    "/api/archives/:path*",
  ],
}

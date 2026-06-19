import { auth } from "@/lib/auth"
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
  if (!path.startsWith("/musaAdv")) return NextResponse.next()

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "anonymous"

  // Only rate-limit mutations — Next.js RSC/prefetch sends many GETs per page load.
  const isMutation = req.method === "POST"

  if (path === "/musaAdv/signup") {
    if (isMutation && !rateLimiter(`signup:${ip}`, 5, 60_000)) {
      return new NextResponse("Too many attempts.", { status: 429 })
    }
    if (isAdmin) return NextResponse.redirect(new URL("/musaAdv/dashboard", req.url))
    return NextResponse.next()
  }

  if (path === "/musaAdv/signup-recovery") {
    return NextResponse.next()
  }

  if (path === "/musaAdv/login" || path === "/musaAdv/forgot-password") {
    if (isMutation && !rateLimiter(`${path}:${ip}`, 5, 60_000)) {
      return new NextResponse("Too many attempts.", { status: 429 })
    }
    if (isAdmin) return NextResponse.redirect(new URL("/musaAdv/dashboard", req.url))
    return NextResponse.next()
  }

  if (path === "/musaAdv") return NextResponse.next()

  if (!isAdmin) {
    const loginUrl = new URL("/musaAdv/login", req.url)
    loginUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/musaAdv",
    "/musaAdv/:path*",
    "/api/auth/:path*",
    "/api/csrf",
    "/api/backups/:path*",
    "/api/upload",
    "/api/archives/:path*",
  ],
}

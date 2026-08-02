import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { ADMIN_BASE, ADMIN_INTERNAL_PREFIX, adminPath, employeePath } from "@/lib/constants"
import { NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rate-limiter"
import type { AdminSessionUser } from "@/types"

const { auth } = NextAuth(authConfig)

const ADMIN_AUTH_PATHS = [
  adminPath("login"),
  adminPath("signup"),
  adminPath("signup-recovery"),
  adminPath("forgot-password"),
] as const

const EMPLOYEE_AUTH_PATHS = [
  employeePath("login"),
  employeePath("signup"),
  employeePath("signup-recovery"),
  employeePath("forgot-password"),
] as const

function isEmployeePath(path: string) {
  const empBase = employeePath()
  return path === empBase || path.startsWith(`${empBase}/`)
}

export default auth((req) => {
  const sessionUser = req.auth?.user as AdminSessionUser | undefined
  const isAdmin = sessionUser?.role === "admin"
  const isEmployee = sessionUser?.role === "employee"
  const canManageCauseList = isAdmin || isEmployee
  const path = req.nextUrl.pathname

  if (path.startsWith("/api/auth")) return NextResponse.next()
  if (
    path === "/api/admin/login" ||
    path === "/api/admin/signup" ||
    path === "/api/admin/reset-password" ||
    path === "/api/employee/signup"
  ) {
    return NextResponse.next()
  }
  if (path === "/api/csrf") {
    if (!canManageCauseList) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
  if (path.startsWith("/api/cases")) {
    if (!canManageCauseList) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

  const isMutation = req.method === "POST"

  if (ADMIN_AUTH_PATHS.includes(path as typeof ADMIN_AUTH_PATHS[number])) {
    if (path === adminPath("signup")) {
      if (isMutation && !rateLimiter(`signup:${ip}`, 5, 60_000)) {
        return new NextResponse("Too many attempts.", { status: 429 })
      }
    } else if (path === adminPath("login") || path === adminPath("forgot-password")) {
      if (isMutation && !rateLimiter(`${path}:${ip}`, 5, 60_000)) {
        return new NextResponse("Too many attempts.", { status: 429 })
      }
    }
    if (isAdmin) return NextResponse.redirect(new URL(adminPath("dashboard"), req.url))
    if (isEmployee) return NextResponse.redirect(new URL(employeePath(), req.url))
    return NextResponse.next()
  }

  if (EMPLOYEE_AUTH_PATHS.includes(path as typeof EMPLOYEE_AUTH_PATHS[number])) {
    if (path === employeePath("signup")) {
      if (isMutation && !rateLimiter(`employee-signup:${ip}`, 5, 60_000)) {
        return new NextResponse("Too many attempts.", { status: 429 })
      }
    } else if (path === employeePath("login") || path === employeePath("forgot-password")) {
      if (isMutation && !rateLimiter(`${path}:${ip}`, 5, 60_000)) {
        return new NextResponse("Too many attempts.", { status: 429 })
      }
    }
    if (isEmployee) return NextResponse.redirect(new URL(employeePath(), req.url))
    if (isAdmin) return NextResponse.redirect(new URL(employeePath(), req.url))
    return NextResponse.next()
  }

  if (path === ADMIN_BASE) return NextResponse.next()

  if (isEmployeePath(path)) {
    if (isAdmin || isEmployee) return NextResponse.next()
    if (path === employeePath()) return NextResponse.next()
    const loginUrl = new URL(employeePath("login"), req.url)
    loginUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(loginUrl)
  }

  if (!isAdmin) {
    const loginUrl = new URL(isEmployee ? employeePath("login") : adminPath("login"), req.url)
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
    "/api/admin/login",
    "/api/admin/signup",
    "/api/admin/reset-password",
    "/api/employee/signup",
    "/api/csrf",
    "/api/backups/:path*",
    "/api/upload",
    "/api/archives/:path*",
    "/api/cases/:path*",
  ],
}

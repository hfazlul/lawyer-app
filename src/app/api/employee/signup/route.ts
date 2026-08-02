import { NextResponse } from "next/server"
import { createEmployeeAccount } from "@/lib/employee-signup"
import { adminSignupSchema } from "@/lib/admin-signup"
import { rateLimiter } from "@/lib/rate-limiter"

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "anonymous"

  if (!rateLimiter(`employee-signup-api:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = adminSignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  try {
    const result = await createEmployeeAccount(parsed.data)
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Signup failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

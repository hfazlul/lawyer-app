import { NextResponse } from "next/server"
import { verifyAdminCredentials } from "@/lib/auth"

/** Pre-check credentials and return a clear reason (does not create a session). */
export async function POST(req: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const email = body.email ?? ""
  const password = body.password ?? ""
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const result = await verifyAdminCredentials(email, password)
  if (!result.ok) {
    const messages = {
      invalid_input: "Invalid email or password format",
      not_found: "No account found for this email on this site",
      bad_password: "Password does not match",
    } as const
    return NextResponse.json(
      { error: messages[result.reason], reason: result.reason },
      { status: 401 }
    )
  }

  return NextResponse.json({ ok: true, email: result.admin.email })
}

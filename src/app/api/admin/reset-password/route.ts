import { NextResponse } from "next/server"
import { resetAdminCredentials } from "@/lib/reset-admin-credentials"

export async function POST(req: Request) {
  let body: {
    secretKey?: string
    newEmail?: string
    newPassword?: string
    portal?: "admin" | "employee"
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }

  const portal = body.portal === "employee" ? "employee" : "admin"

  const result = await resetAdminCredentials({
    secretKey: body.secretKey ?? "",
    newEmail: body.newEmail,
    newPassword: body.newPassword,
    portal,
  })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}

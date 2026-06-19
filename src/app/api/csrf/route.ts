import { auth } from "@/lib/auth"
import { getOrSetCsrfToken } from "@/lib/csrf"
import { NextResponse } from "next/server"
import type { AdminSessionUser } from "@/types"

export async function GET() {
  const session = await auth()
  const user = session?.user as AdminSessionUser | undefined
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = await getOrSetCsrfToken()
  return NextResponse.json({ token })
}

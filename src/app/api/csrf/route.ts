import { auth } from "@/lib/auth"
import { getOrSetCsrfToken } from "@/lib/csrf"
import { NextResponse } from "next/server"
import { getCauseListSession } from "@/lib/session"

export async function GET() {
  const user = await getCauseListSession()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = await getOrSetCsrfToken()
  return NextResponse.json({ token })
}

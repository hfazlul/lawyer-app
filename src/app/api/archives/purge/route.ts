import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { purgeExpiredArchives } from "@/actions/admin/archive"
import type { AdminSessionUser } from "@/types"

export async function POST(req: Request) {
  const session = await auth()
  const user = session?.user as AdminSessionUser | undefined
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization")

  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`
  const isAdmin = user?.role === "admin"

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await purgeExpiredArchives()
  return NextResponse.json(result)
}

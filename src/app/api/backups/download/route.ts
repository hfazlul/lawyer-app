import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getBackupFilePath } from "@/actions/admin/backup-actions"
import { getAdminSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const file = req.nextUrl.searchParams.get("file")
  if (!file) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 })
  }

  try {
    const filePath = await getBackupFilePath(file)
    const buffer = fs.readFileSync(filePath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${path.basename(file)}"`,
        "Content-Length": String(buffer.length),
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}

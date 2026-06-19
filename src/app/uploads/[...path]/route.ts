import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
}

export const dynamic = "force-dynamic"

/** Serve runtime uploads — Next.js does not serve new public/ files after build. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  if (!segments?.length) {
    return new NextResponse("Not found", { status: 404 })
  }

  const relative = segments.join("/")
  if (relative.includes("..")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const filePath = path.join(UPLOADS_DIR, relative)
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new NextResponse("Not found", { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const data = fs.readFileSync(filePath)

  return new NextResponse(data, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}

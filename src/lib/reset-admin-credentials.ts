import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { Prisma } from "@prisma/client"
import { normalizeAdminEmail } from "@/lib/auth-helpers"

export type ResetPasswordResult =
  | { success: true }
  | { success: false; error: string }

export async function resetAdminCredentials(data: {
  secretKey: string
  newEmail?: string
  newPassword?: string
}): Promise<ResetPasswordResult> {
  const secretKey = data.secretKey.trim()
  const newEmail = data.newEmail?.trim() || undefined
  const newPassword = data.newPassword?.trim() || undefined

  if (!secretKey) {
    return { success: false, error: "Recovery code is required" }
  }
  if (!newEmail && !newPassword) {
    return { success: false, error: "Provide a new email or password" }
  }

  const admin = await prisma.admin.findFirst()
  if (!admin?.secretKey) {
    return { success: false, error: "No admin account found on this site" }
  }

  const isValid = await compare(secretKey, admin.secretKey)
  if (!isValid) {
    return { success: false, error: "Invalid recovery code" }
  }

  const updateData: { email?: string; password?: string } = {}
  if (newEmail) updateData.email = normalizeAdminEmail(newEmail)
  if (newPassword) updateData.password = await hash(newPassword, 12)

  try {
    await prisma.admin.update({ where: { id: admin.id }, data: updateData })
    return { success: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "That email is already in use" }
    }
    console.error("resetAdminCredentials failed:", error)
    return { success: false, error: "Could not update credentials. Try again." }
  }
}

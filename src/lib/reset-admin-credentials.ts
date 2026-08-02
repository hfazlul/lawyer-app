import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { Prisma } from "@prisma/client"
import { normalizeAdminEmail } from "@/lib/auth-helpers"

export type ResetPasswordResult =
  | { success: true }
  | { success: false; error: string }

async function findAccountBySecretKey(secretKey: string) {
  const accounts = await prisma.admin.findMany({
    where: { secretKey: { not: null } },
  })

  for (const account of accounts) {
    if (account.secretKey && (await compare(secretKey, account.secretKey))) {
      return account
    }
  }
  return null
}

export async function resetAdminCredentials(data: {
  secretKey: string
  newEmail?: string
  newPassword?: string
  portal?: "admin" | "employee"
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

  const account = await findAccountBySecretKey(secretKey)
  if (!account) {
    return { success: false, error: "Invalid recovery code" }
  }

  if (data.portal === "admin" && account.role !== "ADMIN") {
    return { success: false, error: "Invalid recovery code" }
  }
  if (data.portal === "employee" && account.role !== "EMPLOYEE") {
    return { success: false, error: "Invalid recovery code" }
  }

  const updateData: { email?: string; password?: string } = {}
  if (newEmail) updateData.email = normalizeAdminEmail(newEmail)
  if (newPassword) updateData.password = await hash(newPassword, 12)

  try {
    await prisma.admin.update({ where: { id: account.id }, data: updateData })
    return { success: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "That email is already in use" }
    }
    console.error("resetAdminCredentials failed:", error)
    return { success: false, error: "Could not update credentials. Try again." }
  }
}

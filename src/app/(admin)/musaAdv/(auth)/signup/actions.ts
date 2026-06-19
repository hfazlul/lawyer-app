"use server"
import { createAdminAccount, adminSignupSchema } from "@/lib/admin-signup"

export async function signupAdmin(data: unknown) {
  const parsed = adminSignupSchema.safeParse(data)
  if (!parsed.success) throw new Error("Invalid data")
  return createAdminAccount(parsed.data)
}

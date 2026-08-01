import { z } from "zod"
import { normalizeAdminEmail } from "@/lib/auth-helpers"

const emailField = z
  .string()
  .email()
  .transform(normalizeAdminEmail)

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(8),
})

export const signupSchema = z.object({
  name: z.string().min(2),
  email: emailField,
  phone: z.string().min(10),
  password: z.string().min(8),
})

export const resetPasswordSchema = z.object({
  secretKey: z.string().min(1),
  newEmail: emailField.optional(),
  newPassword: z.string().min(8).optional(),
}).refine((d) => d.newEmail || d.newPassword, {
  message: "Provide new email or password",
})

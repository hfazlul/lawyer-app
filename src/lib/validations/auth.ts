import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
})

export const resetPasswordSchema = z.object({
  secretKey: z.string().min(1),
  newEmail: z.string().email().optional(),
  newPassword: z.string().min(8).optional(),
}).refine((d) => d.newEmail || d.newPassword, {
  message: "Provide new email or password",
})

"use server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
const schema = z.object({
  name: z.string().min(2), phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")), message: z.string().optional()
})
export async function submitContact(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const { name, phone, email, message } = parsed.data
  await prisma.contactMessage.create({ data: { name, phone, email: email || null, message: message || null } })
  return { success: true }
}

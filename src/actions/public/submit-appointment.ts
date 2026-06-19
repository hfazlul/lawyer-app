"use server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
const schema = z.object({
  name: z.string().min(2), phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  serviceType: z.string().optional(), preferredDate: z.string().optional(), message: z.string().optional()
})
export async function submitAppointment(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const { name, phone, email, serviceType, preferredDate, message } = parsed.data
  await prisma.appointmentMessage.create({
    data: { name, phone, email: email || null, serviceType: serviceType || null,
      preferredDate: preferredDate ? new Date(preferredDate) : null, message: message || null }
  })
  return { success: true }
}

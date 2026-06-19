import { z } from "zod"

export const contactFormSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
})

export const appointmentFormSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  serviceType: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
})

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { z } from "zod"

export const adminSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
})

export type AdminSignupInput = z.infer<typeof adminSignupSchema>

export async function createAdminAccount(data: AdminSignupInput) {
  const existing = await prisma.admin.findFirst()
  if (existing) throw new Error("Admin already exists")

  const hashedPw = await hash(data.password, 12)
  const rawSecret = randomBytes(32).toString("hex")
  const hashedSecret = await hash(rawSecret, 12)

  await prisma.admin.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPw,
      secretKey: hashedSecret,
    },
  })

  return { secretKey: rawSecret }
}

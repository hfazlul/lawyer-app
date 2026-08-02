import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { adminSignupSchema, type AdminSignupInput } from "@/lib/admin-signup"
import { normalizeAdminEmail } from "@/lib/auth-helpers"

export async function createEmployeeAccount(data: AdminSignupInput) {
  const parsed = adminSignupSchema.safeParse(data)
  if (!parsed.success) throw new Error("Invalid employee data")

  const existing = await prisma.admin.findFirst({
    where: { email: { equals: normalizeAdminEmail(parsed.data.email), mode: "insensitive" } },
  })
  if (existing) throw new Error("An account with this email already exists")

  const hashedPw = await hash(parsed.data.password, 12)
  const rawSecret = randomBytes(32).toString("hex")
  const hashedSecret = await hash(rawSecret, 12)

  await prisma.admin.create({
    data: {
      name: parsed.data.name.trim(),
      email: normalizeAdminEmail(parsed.data.email),
      phone: parsed.data.phone.trim(),
      password: hashedPw,
      secretKey: hashedSecret,
      role: "EMPLOYEE",
    },
  })

  return { secretKey: rawSecret }
}

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import { loginSchema } from "./validations/auth"
import { normalizeAdminEmail } from "./auth-helpers"
import { dbRoleToSessionRole } from "./auth-roles"
import { authConfig } from "./auth.config"
import type { AdminRole } from "@/types"

export type AuthPortal = "admin" | "employee"

export async function verifyAdminCredentials(
  email: string,
  password: string,
  portal?: AuthPortal
) {
  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return { ok: false as const, reason: "invalid_input" as const }
  }

  const normalizedEmail = normalizeAdminEmail(parsed.data.email)
  const admin = await prisma.admin.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  })
  if (!admin) {
    return { ok: false as const, reason: "not_found" as const }
  }

  const isValid = await compare(parsed.data.password, admin.password)
  if (!isValid) {
    return { ok: false as const, reason: "bad_password" as const }
  }

  const role = dbRoleToSessionRole(admin.role)

  if (portal === "admin" && role !== "admin") {
    return { ok: false as const, reason: "not_found" as const }
  }
  if (portal === "employee" && role !== "employee") {
    return { ok: false as const, reason: "not_found" as const }
  }

  return {
    ok: true as const,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: role as AdminRole,
    },
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
        const password = String(credentials?.password ?? "")
        const result = await verifyAdminCredentials(email, password)
        return result.ok ? result.admin : null
      },
    }),
  ],
})

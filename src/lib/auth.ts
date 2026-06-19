import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import { loginSchema } from "./validations/auth"
import type { AdminRole } from "@/types"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null
        const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } })
        if (!admin) return null
        const isValid = await compare(parsed.data.password, admin.password)
        if (!isValid) return null
        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: "admin" as AdminRole,
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/musaAdv/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin"
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as AdminRole
      }
      return session
    },
  },
})

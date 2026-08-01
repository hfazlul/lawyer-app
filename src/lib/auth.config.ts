import type { NextAuthConfig } from "next-auth"
import type { AdminRole } from "@/types"
import { adminPath } from "@/lib/constants"
import { useSecureCookies } from "@/lib/cookie-security"

const secure = useSecureCookies()

/** Edge-safe auth config (no Prisma/bcrypt) — used by middleware. */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure,
      },
    },
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: adminPath("login") },
  providers: [],
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
} satisfies NextAuthConfig

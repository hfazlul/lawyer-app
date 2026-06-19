export type AdminRole = "admin"

export interface AdminSessionUser {
  id: string
  name?: string | null
  email?: string | null
  phone?: string
  role: AdminRole
}

declare module "next-auth" {
  interface User {
    id?: string
    phone?: string
    role?: AdminRole
  }
  interface Session {
    user: AdminSessionUser
  }
}

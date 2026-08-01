import { AdminSessionProvider } from "@/components/admin/admin-session-provider"

export default function MusaAdvRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminSessionProvider>{children}</AdminSessionProvider>
}

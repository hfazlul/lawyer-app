import LoginGate from "./login-gate"

export const dynamic = "force-dynamic"

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <LoginGate>{children}</LoginGate>
}

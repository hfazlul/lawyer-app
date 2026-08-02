import EmployeeLoginGate from "./login-gate"

export const dynamic = "force-dynamic"

export default function EmployeeLoginLayout({ children }: { children: React.ReactNode }) {
  return <EmployeeLoginGate>{children}</EmployeeLoginGate>
}

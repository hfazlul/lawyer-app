import { redirect } from "next/navigation"
import { getLiveEmployeeCount } from "@/lib/employee-auth-redirect"
import { employeePath } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function EmployeeLoginGate({ children }: { children: React.ReactNode }) {
  const employeeCount = await getLiveEmployeeCount()
  if (employeeCount === 0) redirect(employeePath("signup"))
  return <>{children}</>
}

import { CredentialLoginForm } from "@/components/auth/credential-login-form"
import { EMPLOYEE_BASE, employeePath } from "@/lib/constants"

export default function EmployeeLoginPage() {
  return (
    <CredentialLoginForm
      portal="employee"
      title="Employee Login"
      basePath={EMPLOYEE_BASE}
      defaultDestination={employeePath()}
      forgotPasswordHref={employeePath("forgot-password")}
      signupHref={employeePath("signup")}
    />
  )
}

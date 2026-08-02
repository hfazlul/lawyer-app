import { CredentialSignupForm } from "@/components/auth/credential-signup-form"
import { employeePath } from "@/lib/constants"

const EMPLOYEE_RECOVERY_STORAGE_KEY = "employee_recovery_flash"

export default function EmployeeSignupPage() {
  return (
    <CredentialSignupForm
      title="Create Employee Account"
      description="Sign up with your own email and password. You'll get a recovery code for password reset."
      signupApiPath="/api/employee/signup"
      recoveryStorageKey={EMPLOYEE_RECOVERY_STORAGE_KEY}
      recoveryPageHref={employeePath("signup-recovery")}
      loginHref={employeePath("login")}
    />
  )
}

import { CredentialSignupRecovery } from "@/components/auth/credential-signup-recovery"
import { employeePath } from "@/lib/constants"

const EMPLOYEE_RECOVERY_STORAGE_KEY = "employee_recovery_flash"

export default function EmployeeSignupRecoveryPage() {
  return (
    <CredentialSignupRecovery
      storageKey={EMPLOYEE_RECOVERY_STORAGE_KEY}
      loginHref={employeePath("login")}
    />
  )
}

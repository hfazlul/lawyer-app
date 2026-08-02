import { CredentialResetForm } from "@/components/auth/credential-reset-form"
import { employeePath } from "@/lib/constants"

export default function EmployeeForgotPasswordPage() {
  return <CredentialResetForm portal="employee" loginHref={employeePath("login")} />
}

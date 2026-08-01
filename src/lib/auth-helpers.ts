/** Normalize admin email for storage and lookup (trim + lowercase). */
export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase()
}

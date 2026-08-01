/** Internal App Router folder segment under `src/app/(admin)/` — do not change per deployment. */
export const ADMIN_INTERNAL_PREFIX = "musaAdv"

/**
 * Public admin URL prefix (no leading slash). Set per deployment:
 * `NEXT_PUBLIC_ADMIN_PATH_PREFIX=saifulAdv` on advsaiful.com; omit or `musaAdv` on advmusa.com.
 */
export const ADMIN_PATH_PREFIX =
  process.env.NEXT_PUBLIC_ADMIN_PATH_PREFIX?.replace(/^\/+|\/+$/g, "") || ADMIN_INTERNAL_PREFIX

/** Public admin base path, e.g. `/musaAdv` or `/saifulAdv`. */
export const ADMIN_BASE = `/${ADMIN_PATH_PREFIX}`

export function adminPath(...segments: string[]): string {
  const suffix = segments.filter(Boolean).join("/")
  return suffix ? `${ADMIN_BASE}/${suffix}` : ADMIN_BASE
}

export const AUTH_ROUTES = [
  adminPath("login"),
  adminPath("signup"),
  adminPath("signup-recovery"),
  adminPath("forgot-password"),
] as const

export const DEFAULT_NAV_ITEMS = [
  { labelEn: "Home", labelBn: "হোম", href: "/", sortOrder: 1 },
  { labelEn: "Services", labelBn: "সেবাসমূহ", href: "/services", sortOrder: 2 },
  { labelEn: "Appointment", labelBn: "অ্যাপয়েন্টমেন্ট", href: "/appointment", sortOrder: 3 },
  { labelEn: "About", labelBn: "পরিচিতি", href: "/about", sortOrder: 4 },
  { labelEn: "Contact", labelBn: "যোগাযোগ", href: "/contact", sortOrder: 5 },
] as const
export const ARCHIVE_RETENTION_DAYS = 5
export const CSRF_COOKIE = "csrf_token"
export const LANG_COOKIE = "lang"

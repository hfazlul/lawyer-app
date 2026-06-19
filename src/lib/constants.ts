export const ADMIN_BASE = "/musaAdv"
export const AUTH_ROUTES = ["/musaAdv/login", "/musaAdv/signup", "/musaAdv/signup-recovery", "/musaAdv/forgot-password"] as const
export const DEFAULT_NAV_ITEMS = [
  { labelEn: "Home", labelBn: "হোম", href: "/", sortOrder: 1 },
  { labelEn: "Services", labelBn: "সেবাসমূহ", href: "/services", sortOrder: 2 },
  { labelEn: "Appointment", labelBn: "অ্যাপয়েন্টমেন্ট", href: "/appointment", sortOrder: 3 },
  { labelEn: "About", labelBn: "পরিচিতি", href: "/about", sortOrder: 4 },
  { labelEn: "Contact", labelBn: "যোগাযোগ", href: "/contact", sortOrder: 5 },
] as const
export const ARCHIVE_RETENTION_DAYS = 7
export const CSRF_COOKIE = "csrf_token"
export const LANG_COOKIE = "lang"

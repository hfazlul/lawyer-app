import { ADMIN_BASE } from "@/lib/constants"

export interface BreadcrumbItem {
  label: string
  href?: string
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "client-site": "Client Site",
  settings: "Site Settings",
  navigation: "Navigation",
  archive: "Archive",
  home: "Home",
  services: "Services",
  appointment: "Appointment",
  about: "About",
  contact: "Contact",
  lawyer: "Lawyer",
  "judge-court": "Judge Court",
  "high-court": "High Court",
  "supreme-court": "Supreme Court",
  "cause-list": "Cause List",
  clients: "All Clients",
  system: "System",
  backup: "Backup & Restore",
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (!pathname.startsWith(ADMIN_BASE)) return []

  const segments = pathname.replace(new RegExp(`^${ADMIN_BASE}/?`), "").split("/").filter(Boolean)
  if (segments.length === 0) return [{ label: "Dashboard" }]

  const crumbs: BreadcrumbItem[] = []
  let path = ADMIN_BASE

  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`
    const label = ROUTE_LABELS[segments[i]] ?? segments[i].replace(/-/g, " ")
    const isLast = i === segments.length - 1
    crumbs.push({ label, href: isLast ? undefined : path })
  }

  return crumbs
}

"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Globe,
  Scale,
  Home,
  Briefcase,
  Calendar,
  User,
  Phone,
  Gavel,
  Building2,
  Landmark,
  ListChecks,
  Database,
  Archive,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { adminPath } from "@/lib/constants"
import { useSidebar } from "@/stores/sidebar"
import { useEffect, useState } from "react"

function normalizePath(path: string) {
  if (!path) return "/"
  const withoutQuery = path.split("?")[0]?.split("#")[0] ?? path
  return withoutQuery.replace(/\/$/, "") || "/"
}

function getActiveHref(pathname: string, items: { href: string }[]) {
  const current = normalizePath(pathname)
  let bestMatch: string | null = null

  for (const item of items) {
    const href = normalizePath(item.href)
    if (current === href || current.startsWith(`${href}/`)) {
      if (!bestMatch || href.length > bestMatch.length) {
        bestMatch = href
      }
    }
  }

  return bestMatch
}

const sections = [
  {
    title: "Dashboard",
    items: [{ href: adminPath("dashboard"), label: "Home", icon: LayoutDashboard }],
  },
  {
    title: "Client Site",
    items: [
      { href: adminPath("client-site/settings"), label: "Site Settings", icon: Globe },
      { href: adminPath("client-site/navigation"), label: "Navigation", icon: ListChecks },
      { href: adminPath("client-site/home"), label: "Home", icon: Home },
      { href: adminPath("client-site/services"), label: "Services", icon: Briefcase },
      { href: adminPath("client-site/appointment"), label: "Appointment", icon: Calendar },
      { href: adminPath("client-site/about"), label: "About", icon: User },
      { href: adminPath("client-site/contact"), label: "Contact", icon: Phone },
      { href: adminPath("client-site/archive"), label: "Archive", icon: Database },
    ],
  },
  {
    title: "Lawyer / Admin",
    items: [
      { href: adminPath("lawyer"), label: "Overview", icon: Scale },
      { href: adminPath("lawyer/judge-court"), label: "Judge Court", icon: Gavel },
      { href: adminPath("lawyer/high-court"), label: "High Court", icon: Building2 },
      { href: adminPath("lawyer/supreme-court"), label: "Supreme Court", icon: Landmark },
      { href: adminPath("lawyer/cause-list"), label: "Cause List", icon: ListChecks },
      { href: adminPath("lawyer/archive"), label: "Archive", icon: Archive },
      { href: adminPath("system/backup"), label: "Backup & Restore", icon: Database },
    ],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Dashboard: true,
    "Client Site": true,
    "Lawyer / Admin": true,
  })

  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b px-4">
        <Globe className="mr-2 h-5 w-5 text-primary" />
        <span className="font-semibold">Musa Admin</span>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {sections.map((section) => (
          <div key={section.title}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              onClick={() => setOpenSections((s) => ({ ...s, [section.title]: !s[section.title] }))}
            >
              {section.title}
              <ChevronDown className={cn("h-4 w-4 transition-transform", openSections[section.title] && "rotate-180")} />
            </button>
            {openSections[section.title] && (
              <ul className="mt-1 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const activeHref = getActiveHref(pathname, section.items)
                  const active = activeHref === normalizePath(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                          active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={close}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card md:hidden">
            <SidebarContent onNavigate={close} />
          </aside>
        </>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
        <SidebarContent />
      </aside>
    </>
  )
}

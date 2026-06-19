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
  Users,
  Database,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/stores/sidebar"
import { useState } from "react"

const sections = [
  {
    title: "Dashboard",
    items: [{ href: "/musaAdv/dashboard", label: "Home", icon: LayoutDashboard }],
  },
  {
    title: "Client Site",
    items: [
      { href: "/musaAdv/client-site/settings", label: "Site Settings", icon: Globe },
      { href: "/musaAdv/client-site/navigation", label: "Navigation", icon: ListChecks },
      { href: "/musaAdv/client-site/home", label: "Home", icon: Home },
      { href: "/musaAdv/client-site/services", label: "Services", icon: Briefcase },
      { href: "/musaAdv/client-site/appointment", label: "Appointment", icon: Calendar },
      { href: "/musaAdv/client-site/about", label: "About", icon: User },
      { href: "/musaAdv/client-site/contact", label: "Contact", icon: Phone },
      { href: "/musaAdv/client-site/archive", label: "Archive", icon: Database },
    ],
  },
  {
    title: "Lawyer / Admin",
    items: [
      { href: "/musaAdv/lawyer", label: "Overview", icon: Scale },
      { href: "/musaAdv/lawyer/judge-court", label: "Judge Court", icon: Gavel },
      { href: "/musaAdv/lawyer/high-court", label: "High Court", icon: Building2 },
      { href: "/musaAdv/lawyer/supreme-court", label: "Supreme Court", icon: Landmark },
      { href: "/musaAdv/lawyer/cause-list", label: "Cause List", icon: ListChecks },
      { href: "/musaAdv/lawyer/clients", label: "All Clients", icon: Users },
      { href: "/musaAdv/system/backup", label: "Backup & Restore", icon: Database },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen } = useSidebar()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Dashboard: true,
    "Client Site": true,
    "Lawyer / Admin": true,
  })

  if (!isOpen) return null

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="flex h-16 items-center border-b px-4">
        <Globe className="mr-2 h-5 w-5 text-primary" />
        <span className="font-semibold">Musa Admin</span>
      </div>
      <nav className="space-y-2 p-4">
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
                  const active = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
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
    </aside>
  )
}

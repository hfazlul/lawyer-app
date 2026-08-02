"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ChevronRight, LogOut, Menu } from "lucide-react"
import { useSidebar } from "@/stores/sidebar"
import { getBreadcrumbs } from "@/lib/dashboard-nav"
import { adminPath } from "@/lib/constants"

export function Header() {
  const { data: session } = useSession()
  const { toggle } = useSidebar()
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
          <ol className="flex items-center gap-1 text-sm">
            <li>
              <Link href={adminPath("dashboard")} className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            </li>
            {breadcrumbs.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                {crumb.href ? (
                  <Link href={crumb.href} className="truncate text-muted-foreground hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="truncate text-sm text-muted-foreground sm:hidden">Admin</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{session?.user?.name ?? "Admin"}</p>
          <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: adminPath("login") })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}

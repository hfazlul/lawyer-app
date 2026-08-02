"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { employeePath } from "@/lib/constants"

export function EmployeeHeader() {
  const { data: session } = useSession()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="min-w-0">
        <p className="text-sm font-semibold">Cause List</p>
        <p className="text-xs text-muted-foreground">Employee Portal</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{session?.user?.name ?? "Employee"}</p>
          <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: employeePath("login") })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}

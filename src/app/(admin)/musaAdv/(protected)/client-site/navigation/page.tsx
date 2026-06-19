import { getNavItemsAdmin } from "@/actions/admin/nav-items"
import { NavItemsManager } from "./nav-items-manager"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function NavigationPage() {
  const items = await getNavItemsAdmin()
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Navigation</h1>
          <p className="text-muted-foreground">Manage header navigation links with bilingual labels.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview site</Link>
        </Button>
      </div>
      <NavItemsManager items={items} />
    </div>
  )
}

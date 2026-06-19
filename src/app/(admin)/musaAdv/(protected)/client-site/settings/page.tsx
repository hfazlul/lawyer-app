import { getSiteSettingsAdmin } from "@/actions/admin/site-settings"
import { SiteSettingsForm } from "./settings-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function SiteSettingsPage() {
  const settings = await getSiteSettingsAdmin()
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Logo, social links, footer, and search options.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview site</Link>
        </Button>
      </div>
      <SiteSettingsForm settings={settings} />
    </div>
  )
}

import { getServicesAdmin } from "@/actions/admin/services"
import { getServicesSettingAdmin } from "@/actions/admin/services-setting"
import { ServicesManager } from "./services-manager"
import { ServicesListingHeroForm } from "./services-listing-hero-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function AdminServicesPage() {
  const [services, listingHero] = await Promise.all([
    getServicesAdmin(),
    getServicesSettingAdmin(),
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services CMS</h1>
          <p className="text-muted-foreground">
            Manage all service cards here — they appear on both the home page and <code>/services</code>.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/services" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview page</Link>
        </Button>
      </div>

      <ServicesListingHeroForm data={listingHero} />
      <ServicesManager services={services} />
    </div>
  )
}

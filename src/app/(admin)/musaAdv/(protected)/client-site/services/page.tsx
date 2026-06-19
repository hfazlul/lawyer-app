import { getServicesAdmin } from "@/actions/admin/services"
import { ServicesManager } from "./services-manager"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function AdminServicesPage() {
  const services = await getServicesAdmin()
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services CMS</h1>
          <p className="text-muted-foreground">Manage service pages with bilingual content and icons.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/services" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview page</Link>
        </Button>
      </div>
      <ServicesManager services={services} />
    </div>
  )
}

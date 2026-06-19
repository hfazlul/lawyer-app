import { getContactSettingsAdmin } from "@/actions/admin/contact"
import { ContactForm } from "./contact-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function AdminContactPage() {
  const data = await getContactSettingsAdmin()
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contact Page CMS</h1>
          <p className="text-muted-foreground">Banner, office hours, map image, address, and contact info.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/contact" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview page</Link>
        </Button>
      </div>
      <ContactForm data={data} />
    </div>
  )
}

import { getAppointmentSettingsAdmin } from "@/actions/admin/appointment"
import { AppointmentForm } from "./appointment-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function AdminAppointmentPage() {
  const data = await getAppointmentSettingsAdmin()
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appointment Page CMS</h1>
          <p className="text-muted-foreground">Banner, office hours, map image, and contact details.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/appointment" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview page</Link>
        </Button>
      </div>
      <AppointmentForm data={data} />
    </div>
  )
}

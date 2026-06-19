import { getAboutPageAdmin } from "@/actions/admin/about"
import { AboutForm } from "./about-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function AdminAboutPage() {
  const data = await getAboutPageAdmin()
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">About Page CMS</h1>
          <p className="text-muted-foreground">Bilingual biography, experience, education, mission, and values.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/about" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview page</Link>
        </Button>
      </div>
      <AboutForm data={data} />
    </div>
  )
}

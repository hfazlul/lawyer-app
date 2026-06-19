import { prisma } from "@/lib/prisma"
import { HomeCms } from "./home-cms"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default async function AdminHomePage() {
  const [slides, intro, featured, stats, activities, testimonials] = await Promise.all([
    prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.homeIntro.findFirst(),
    prisma.featuredService.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.successStat.findMany({ orderBy: { id: "asc" } }),
    prisma.activity.findMany({ orderBy: { id: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { id: "asc" } }),
  ])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Home Page CMS</h1>
          <p className="text-muted-foreground">Hero slides, welcome, featured services, stats, activities, and testimonials.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview site</Link>
        </Button>
      </div>
      <HomeCms
        slides={slides}
        intro={intro}
        featured={featured}
        stats={stats}
        activities={activities}
        testimonials={testimonials}
      />
    </div>
  )
}

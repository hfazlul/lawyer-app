import { Skeleton } from "@/components/ui/skeleton"

export function PublicPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-12">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

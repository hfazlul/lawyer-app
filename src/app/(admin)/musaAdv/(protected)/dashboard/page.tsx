import { Suspense } from "react"
import nextDynamic from "next/dynamic"
import { getDashboardStats } from "@/actions/admin/dashboard-stats"
import { AnalyticsCards } from "@/components/dashboard/analytics-cards"
import { DashboardMessages } from "@/components/dashboard/dashboard-messages"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const dynamic = "force-dynamic"

const Charts = nextDynamic(
  () => import("@/components/dashboard/charts").then((mod) => mod.Charts),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-md" />
        </CardContent>
      </Card>
    ),
  }
)

function MessagesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Case analytics and client messages overview
        </p>
      </div>

      <AnalyticsCards stats={stats} />

      <Charts
        monthlyCases={stats.monthlyCases}
        yearlyCases={stats.yearlyCases}
        courtDistribution={stats.courtDistribution}
        solved={stats.solvedCases}
        deactive={stats.deactiveCases}
        pending={stats.pendingCases}
      />

      <Suspense fallback={<MessagesSkeleton />}>
        <DashboardMessages />
      </Suspense>
    </div>
  )
}

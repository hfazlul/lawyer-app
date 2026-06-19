import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, CheckCircle2, XCircle, Clock, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface Stats {
  totalCases: number
  solvedCases: number
  failedCases: number
  pendingCases: number
  runningCasesThisWeek: number
}

const CARD_CONFIG = [
  {
    title: "Total Cases",
    key: "totalCases" as const,
    icon: Briefcase,
    accent: "text-primary",
    bg: "bg-primary/5",
  },
  {
    title: "Solved",
    key: "solvedCases" as const,
    icon: CheckCircle2,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Failed",
    key: "failedCases" as const,
    icon: XCircle,
    accent: "text-red-600",
    bg: "bg-red-50",
  },
  {
    title: "Pending",
    key: "pendingCases" as const,
    icon: Clock,
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Running This Week",
    key: "runningCasesThisWeek" as const,
    icon: CalendarDays,
    accent: "text-blue-600",
    bg: "bg-blue-50",
    subtitle: "Sun – Thu",
  },
]

export function AnalyticsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn("rounded-md p-2", card.bg)}>
                <Icon className={cn("h-4 w-4", card.accent)} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">{stats[card.key]}</p>
              {"subtitle" in card && card.subtitle && (
                <p className="mt-1 text-xs text-muted-foreground">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

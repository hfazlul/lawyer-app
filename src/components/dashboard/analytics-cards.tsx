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
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    glow: "shadow-slate-900/20",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
  {
    title: "Solved",
    key: "solvedCases" as const,
    icon: CheckCircle2,
    gradient: "from-emerald-500 via-emerald-600 to-teal-700",
    glow: "shadow-emerald-600/25",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
  {
    title: "Failed",
    key: "failedCases" as const,
    icon: XCircle,
    gradient: "from-rose-500 via-red-500 to-red-700",
    glow: "shadow-red-500/25",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
  {
    title: "Pending",
    key: "pendingCases" as const,
    icon: Clock,
    gradient: "from-amber-400 via-amber-500 to-orange-600",
    glow: "shadow-amber-500/25",
    iconBg: "bg-white/20",
    iconColor: "text-white",
  },
  {
    title: "Running This Week",
    key: "runningCasesThisWeek" as const,
    icon: CalendarDays,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    glow: "shadow-blue-500/25",
    iconBg: "bg-white/15",
    iconColor: "text-white",
    subtitle: "Sun – Thu",
  },
]

export function AnalyticsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className={cn(
              "relative overflow-hidden border-0 bg-gradient-to-br text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
              card.gradient,
              card.glow
            )}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/85">{card.title}</CardTitle>
              <div className={cn("rounded-xl p-2.5 backdrop-blur-sm", card.iconBg)}>
                <Icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold tabular-nums tracking-tight text-white">
                {stats[card.key]}
              </p>
              {"subtitle" in card && card.subtitle && (
                <p className="mt-1 text-xs font-medium text-white/70">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

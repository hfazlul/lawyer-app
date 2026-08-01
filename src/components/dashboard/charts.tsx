"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { BarChart3 } from "lucide-react"

const COLORS = [
  "hsl(var(--primary))",
  "#d97706", // Amber
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#f43f5e", // Rose
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface ChartsProps {
  monthlyCases: { month: number; count: number }[]
  yearlyCases: { year: number; count: number }[]
  courtDistribution: { court: string; _count: number }[]
  solved: number
  failed: number
  pending: number
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <BarChart3 className="h-10 w-10 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

function formatCourtName(court: string): string {
  return court.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const renderCourtLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 22
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      className="text-[11px] fill-muted-foreground font-medium"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  )
}

const renderSuccessLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 18
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      className="text-[11px] fill-muted-foreground font-medium"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name}: ${value}`}
    </text>
  )
}

export function Charts({
  monthlyCases,
  yearlyCases,
  courtDistribution,
  solved,
  failed,
  pending,
}: ChartsProps) {
  const monthlyData = monthlyCases.map((m) => ({
    name: MONTHS[m.month - 1],
    cases: m.count,
  }))
  const yearlyData = yearlyCases.map((y) => ({
    name: String(y.year),
    cases: y.count,
  }))
  const courtData = courtDistribution.map((c) => ({
    name: formatCourtName(c.court),
    value: c._count,
  }))
  const successData = [
    { name: "Solved", value: solved },
    { name: "Failed", value: failed },
    { name: "Pending", value: pending },
  ].filter((d) => d.value > 0)

  const currentYear = new Date().getFullYear()
  const hasMonthly = monthlyData.some((d) => d.cases > 0)
  const hasYearly = yearlyData.length > 0
  const hasCourt = courtData.length > 0
  const hasSuccess = successData.length > 0

  const themeTooltip = (
    <Tooltip
      contentStyle={{
        borderRadius: "8px",
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
      }}
      itemStyle={{
        color: "hsl(var(--foreground))",
        fontSize: "12px",
      }}
      labelStyle={{
        color: "hsl(var(--muted-foreground))",
        fontSize: "12px",
        fontWeight: 600,
      }}
    />
  )

  const legendFormatter = (value: string) => (
    <span className="text-xs font-medium text-foreground">{value}</span>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Monthly Cases ({currentYear})</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {hasMonthly ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--border))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="hsl(var(--border))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                {themeTooltip}
                <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="No cases recorded this year" />
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Yearly Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {hasYearly ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--border))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="hsl(var(--border))" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                {themeTooltip}
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ fill: "#d97706", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="No yearly case data yet" />
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Court Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {hasCourt ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courtData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  label={renderCourtLabel}
                  labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                >
                  {courtData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={legendFormatter} />
                {themeTooltip}
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="No court data available" />
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Case Success Rate</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {hasSuccess ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={75}
                  label={renderSuccessLabel}
                  labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                >
                  {successData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Solved"
                          ? "#10b981"
                          : entry.name === "Failed"
                            ? "#ef4444"
                            : "#3b82f6"
                      }
                    />
                  ))}
                </Pie>
                <Legend formatter={legendFormatter} />
                {themeTooltip}
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="No case outcomes to display" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

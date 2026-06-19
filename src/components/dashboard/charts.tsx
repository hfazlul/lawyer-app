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

const COLORS = ["hsl(220 55% 18%)", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Cases ({currentYear})</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {hasMonthly ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="cases" fill="hsl(220 55% 18%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="No cases recorded this year" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yearly Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {hasYearly ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="hsl(43 74% 49%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(43 74% 49%)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="No yearly case data yet" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Court Distribution</CardTitle>
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
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {courtData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="No court data available" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Case Success Rate</CardTitle>
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
                  innerRadius={50}
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {successData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Solved"
                          ? "#10b981"
                          : entry.name === "Failed"
                            ? "#ef4444"
                            : COLORS[i % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
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

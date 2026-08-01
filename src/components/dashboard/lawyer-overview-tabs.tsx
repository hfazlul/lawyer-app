"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseTable } from "@/components/dashboard/case-table"
import type { Case, CourtType } from "@prisma/client"

const COURT_FILTERS = [
  { value: "all", label: "All Cases" },
  { value: "JUDGE_COURT", label: "Judge Court" },
  { value: "HIGH_COURT", label: "High Court" },
  { value: "SUPREME_COURT", label: "Supreme Court" },
] as const

type CourtFilter = (typeof COURT_FILTERS)[number]["value"]

export function LawyerOverviewTabs({ cases }: { cases: Case[] }) {
  const [activeTab, setActiveTab] = useState<CourtFilter>("all")

  const counts = useMemo(
    () => ({
      all: cases.length,
      JUDGE_COURT: cases.filter((c) => c.court === "JUDGE_COURT").length,
      HIGH_COURT: cases.filter((c) => c.court === "HIGH_COURT").length,
      SUPREME_COURT: cases.filter((c) => c.court === "SUPREME_COURT").length,
    }),
    [cases]
  )

  const filteredCases = useMemo(() => {
    if (activeTab === "all") return cases
    return cases.filter((c) => c.court === activeTab)
  }, [activeTab, cases])

  const defaultCourt: CourtType =
    activeTab === "all" ? "JUDGE_COURT" : (activeTab as CourtType)

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CourtFilter)}>
        <TabsList className="lawyer-overview-tabs flex h-auto w-full flex-wrap justify-start gap-1.5 rounded-xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 p-1.5 shadow-sm sm:gap-2 sm:p-2">
          {COURT_FILTERS.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="rounded-lg border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-500 transition-all duration-300 hover:border-emerald-200 hover:bg-white/80 hover:text-emerald-900 data-[state=active]:border-emerald-300/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0a1f14] data-[state=active]:via-[#134e2a] data-[state=active]:to-[#1a6b42] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-900/35 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {filter.label}
              <span
                className={
                  activeTab === filter.value
                    ? "ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold tabular-nums text-white"
                    : "ml-1.5 tabular-nums opacity-70"
                }
              >
                {activeTab === filter.value ? counts[filter.value] : `(${counts[filter.value]})`}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <CaseTable
        key={activeTab}
        cases={filteredCases}
        title={
          activeTab === "all"
            ? "All Clients / Cases"
            : `${COURT_FILTERS.find((f) => f.value === activeTab)?.label} Cases`
        }
        defaultCourt={defaultCourt}
        showCourtColumn={activeTab === "all"}
        historyPhoneFilter
        searchable
      />
    </div>
  )
}
